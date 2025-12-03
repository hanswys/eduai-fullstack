import os
import io
import logging
import uuid
import datetime
import httpx # NEW IMPORT
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Security
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from dotenv import load_dotenv
from PIL import Image
from google.genai import types
from google import genai

# --- FIREBASE ADMIN IMPORTS ---
import firebase_admin
from firebase_admin import auth, credentials, firestore, storage

# --- Logging Configuration ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend")

load_dotenv()

# --- FIREBASE INITIALIZATION ---
# We initialize it once. This handles Auth, Firestore, and Storage.
try:
    if os.path.exists("serviceAccountKey.json"):
        cred = credentials.Certificate("serviceAccountKey.json")
        # Initialize with storageBucket for easier file access
        firebase_admin.initialize_app(cred, {
            'storageBucket': os.getenv("FIREBASE_STORAGE_BUCKET") # e.g. 'project-id.appspot.com'
        })
        logger.info("Firebase Admin initialized.")
    else:
        logger.warning("serviceAccountKey.json not found!")
except ValueError:
    pass 

# Initialize Clients
db = firestore.client()
bucket = storage.bucket() # Uses the bucket defined in initialize_app

# --- GEMINI SETUP ---
GENAI_API_KEY = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=GENAI_API_KEY) if GENAI_API_KEY else None
PRO_MODEL_ID = "gemini-3-pro-image-preview"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SCHEMAS ---
class FeedbackRequest(BaseModel):
    message: str
    path: Optional[str] = "Unknown" # Helpful to know which page they were on

class TextRequest(BaseModel):
    text: str

class ActivityItem(BaseModel):
    id: str
    title: str
    type: str # 'visual-notes' or 'edulens'
    time: str
    imageUrl: str

class UserProfileResponse(BaseModel):
    uid: str
    email: str
    tokens_remaining: int
    streak_count: int
    recentActivity: List[ActivityItem]

# --- UTILS ---

def upload_to_firebase(image_data: bytes, folder: str) -> str:
    """Uploads bytes to Firebase Storage and returns public URL"""
    filename = f"{folder}/{uuid.uuid4()}.png"
    blob = bucket.blob(filename)
    
    blob.upload_from_string(image_data, content_type='image/png')
    
    # Note: Ensure your Firebase Storage Rules allow public read for this to work 
    # OR use signed URLs. For this demo, we make the specific file public.
    blob.make_public()
    return blob.public_url

def format_time_ago(timestamp: datetime.datetime) -> str:
    """Converts Firestore timestamp to '2 hours ago'"""
    if not timestamp: return "Unknown"
    # Ensure timezone awareness compatibility
    now = datetime.datetime.now(datetime.timezone.utc)
    # Firestore returns datetime with timezone, ensure we match
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=datetime.timezone.utc)
        
    diff = now - timestamp
    seconds = diff.total_seconds()
    
    if seconds < 60: return "Just now"
    if seconds < 3600: return f"{int(seconds // 60)} mins ago"
    if seconds < 86400: return f"{int(seconds // 3600)} hours ago"
    return f"{int(seconds // 86400)} days ago"

# --- AUTH & DB DEPENDENCY ---
security = HTTPBearer()

async def get_current_user_doc(creds: HTTPAuthorizationCredentials = Security(security)) -> Dict[str, Any]:
    """
    1. Verifies Firebase Token.
    2. Checks if User Document exists in Firestore.
    3. Creates it if missing.
    4. Returns the User Data Dict (including UID).
    """
    token = creds.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        email = decoded_token.get('email', 'no-email')
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid Token")

    # Reference to the user document in Firestore
    user_ref = db.collection('users').document(uid)
    doc = user_ref.get()

    if not doc.exists:
        # Create new user in Firestore
        new_user = {
            "uid": uid,
            "email": email,
            "tokens_remaining": 5,
            "streak_count": 1,
            "created_at": firestore.SERVER_TIMESTAMP
        }
        user_ref.set(new_user)
        return new_user
    
    # Return existing data merged with UID for convenience
    user_data = doc.to_dict()
    user_data['uid'] = uid 
    return user_data

# --- ROUTES ---

@app.get("/users/me", response_model=UserProfileResponse)
def read_users_me(user_data: Dict = Depends(get_current_user_doc)):
    uid = user_data['uid']
    
    # 1. Fetch History Subcollection
    # Structure: users/{uid}/history/{activity_id}
    history_ref = db.collection('users').document(uid).collection('history')
    # Order by created_at descending, limit 5
    docs = history_ref.order_by('created_at', direction=firestore.Query.DESCENDING).limit(5).stream()
    
    recent_activity = []
    for doc in docs:
        data = doc.to_dict()
        recent_activity.append({
            "id": doc.id,
            "title": data.get("title", "Untitled"),
            "type": data.get("type", "visual-notes"),
            "time": format_time_ago(data.get("created_at")),
            "imageUrl": data.get("image_url", "")
        })

    return {
        "uid": uid,
        "email": user_data.get("email"),
        "tokens_remaining": user_data.get("tokens_remaining", 0),
        "streak_count": user_data.get("streak_count", 0),
        "recentActivity": recent_activity
    }

@app.post("/api/visual-notes")
async def generate_visual_notes(
    request: TextRequest, 
    user_data: Dict = Depends(get_current_user_doc)
):
    uid = user_data['uid']
    tokens = user_data.get('tokens_remaining', 0)

    if tokens <= 0:
        raise HTTPException(status_code=402, detail="Insufficient tokens")

    try:
        prompt = f"Analyze and create a visual diagram for: {request.text}"
        response = client.models.generate_content(model=PRO_MODEL_ID, contents=[prompt])
        
        for part in response.parts:
            if part.inline_data:
                # 1. Upload to Storage
                image_url = upload_to_firebase(part.inline_data.data, folder="visual-notes")

                # 2. Add to History (Subcollection)
                history_data = {
                    "title": request.text[:30] + "...",
                    "type": "visual-notes",
                    "image_url": image_url,
                    "created_at": firestore.SERVER_TIMESTAMP
                }
                db.collection('users').document(uid).collection('history').add(history_data)

                # 3. Deduct Token
                # Note: In production, use a Firestore Transaction for safety
                user_ref = db.collection('users').document(uid)
                user_ref.update({"tokens_remaining": firestore.Increment(-1)})

                return StreamingResponse(io.BytesIO(part.inline_data.data), media_type="image/png")
        
        raise HTTPException(status_code=500, detail="No image generated")
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/visual-translation")
async def generate_visual_translation(
    file: UploadFile = File(...), 
    target_lang: str = Form(...),
    user_data: Dict = Depends(get_current_user_doc)
):
    uid = user_data['uid']
    tokens = user_data.get('tokens_remaining', 0)

    if tokens <= 0:
         raise HTTPException(status_code=402, detail="Insufficient tokens")

    try:
        file_bytes = await file.read()
        input_image = Image.open(io.BytesIO(file_bytes))

        prompt = f"Translate text in this image to {target_lang}."
        response = client.models.generate_content(
            model=PRO_MODEL_ID,
            contents=[prompt, input_image],
            config=types.GenerateContentConfig(response_modalities=['TEXT', 'IMAGE'])
        )
        
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if part.inline_data:
                    # 1. Upload
                    image_url = upload_to_firebase(part.inline_data.data, folder="translations")

                    # 2. History
                    history_data = {
                        "title": f"Translation to {target_lang}",
                        "type": "edulens",
                        "image_url": image_url,
                        "created_at": firestore.SERVER_TIMESTAMP
                    }
                    db.collection('users').document(uid).collection('history').add(history_data)

                    # 3. Deduct
                    user_ref = db.collection('users').document(uid)
                    user_ref.update({"tokens_remaining": firestore.Increment(-1)})
                    
                    return StreamingResponse(io.BytesIO(part.inline_data.data), media_type="image/png")

        raise HTTPException(status_code=500, detail="No image generated")
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download")
async def download_proxy(url: str, filename: str = "download.png"):
    """
    Proxies the image request through the backend to bypass CORS 
    and force a file download.
    """
    # Security: simple check to ensure we only proxy firebase images
    if "firebasestorage.googleapis.com" not in url and "appspot.com" not in url:
        raise HTTPException(status_code=400, detail="Invalid image source")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            if response.status_code != 200:
                raise HTTPException(status_code=404, detail="Image not found")
            
            # Create a stream from the content
            return StreamingResponse(
                io.BytesIO(response.content),
                media_type="image/png",
                headers={
                    # This header tells the browser: "Don't open this, download it!"
                    "Content-Disposition": f'attachment; filename="{filename}.png"'
                }
            )
        except Exception as e:
            logger.error(f"Download proxy error: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch image")

@app.post("/api/feedback")
async def submit_feedback(
    feedback: FeedbackRequest,
    user_data: Dict = Depends(get_current_user_doc)
):
    """
    Receives feedback from frontend, creates a GitHub Issue.
    """
    # 1. Load Secrets
    pat = os.getenv("GITHUB_PAT")
    owner = os.getenv("GITHUB_REPO_OWNER")
    repo = os.getenv("GITHUB_REPO_NAME")
    
    if not all([pat, owner, repo]):
        logger.error("GitHub configuration missing in .env")
        raise HTTPException(status_code=500, detail="Server configuration error")

    # 2. Format the Issue Body
    user_email = user_data.get('email', 'Unknown')
    user_uid = user_data.get('uid', 'Unknown')
    
    issue_title = f"Feedback from {user_email}"
    issue_body = f"""
### User Feedback
**User:** {user_email} (UID: `{user_uid}`)
**Page:** `{feedback.path}`
**Timestamp:** {datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

---
### Message
{feedback.message}
    """

    # 3. Send to GitHub
    url = f"https://api.github.com/repos/{owner}/{repo}/issues"
    headers = {
        "Authorization": f"token {pat}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
    }
    payload = {
        "title": issue_title,
        "body": issue_body,
        "labels": ["user-feedback"] # Ensure this label exists in your repo or remove this line
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers)

    if response.status_code != 201:
        logger.error(f"GitHub API Error: {response.text}")
        raise HTTPException(status_code=500, detail="Failed to submit feedback to GitHub")

    return {"status": "success", "issue_url": response.json().get("html_url")}
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)