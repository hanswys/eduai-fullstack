import os
import io
import json
import logging
import uuid
import datetime
import httpx 
from typing import Optional, List, Dict, Any

# FIXED TYPO: UploadfFile -> UploadFile
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
# 1. Fetch Bucket Name and Validate immediately
storage_bucket = os.getenv("FIREBASE_STORAGE_BUCKET")
if not storage_bucket:
    logger.error("CRITICAL: FIREBASE_STORAGE_BUCKET env var is missing.")
    raise ValueError("FIREBASE_STORAGE_BUCKET environment variable is required.")

if not firebase_admin._apps:
    sa_key_env = os.getenv("FIREBASE_SA_KEY")
    
    # Priority 1: Load from Environment Variable (Production/Docker)
    if sa_key_env:
        try:
            service_account_info = json.loads(sa_key_env)
            cred = credentials.Certificate(service_account_info)
            firebase_admin.initialize_app(cred, {
                'storageBucket': storage_bucket
            })
            logger.info("Firebase Admin initialized from FIREBASE_SA_KEY env var.")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse FIREBASE_SA_KEY: {e}")
            raise ValueError("Invalid JSON in FIREBASE_SA_KEY environment variable")

    # Priority 2: Fallback to local file (Local Dev)
    elif os.path.exists("serviceAccountKey.json"):
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred, {
            'storageBucket': storage_bucket
        })
        logger.info("Firebase Admin initialized using local serviceAccountKey.json.")
    
    # Priority 3: Default Credentials (Cloud Run / App Engine)
    else:
        logger.warning("No Service Account key found. Attempting to use Default Credentials.")
        # Note: When using default credentials, we must pass the bucket name 
        # explicitly in the storage.bucket calls or rely on this options dict. 
        firebase_admin.initialize_app(options={
            'storageBucket': storage_bucket
        })

# Initialize Clients
db = firestore.client()

# CRITICAL FIX: Pass the bucket name explicitly. 
# This prevents the "ValueError: Storage bucket name not specified" error
# if the global app config fails to apply the default bucket to the storage client.
bucket = storage.bucket(name=storage_bucket) 

# --- GEMINI SETUP ---
GENAI_API_KEY = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=GENAI_API_KEY) if GENAI_API_KEY else None
PRO_MODEL_ID = "gemini-3-pro-image-preview"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://eduai-fullstack.vercel.app/"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SCHEMAS ---
class FeedbackRequest(BaseModel):
    message: str
    path: Optional[str] = "Unknown" 

class TextRequest(BaseModel):
    text: str

class ActivityItem(BaseModel):
    id: str
    title: str
    type: str 
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
    
    # Note: Ensure your Firebase Storage Rules allow public read 
    blob.make_public()
    return blob.public_url

def format_time_ago(timestamp: datetime.datetime) -> str:
    """Converts Firestore timestamp to '2 hours ago'"""
    if not timestamp: return "Unknown"
    now = datetime.datetime.now(datetime.timezone.utc)
    
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
    
    history_ref = db.collection('users').document(uid).collection('history')
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
                image_url = upload_to_firebase(part.inline_data.data, folder="visual-notes")

                history_data = {
                    "title": request.text[:30] + "...",
                    "type": "visual-notes",
                    "image_url": image_url,
                    "created_at": firestore.SERVER_TIMESTAMP
                }
                db.collection('users').document(uid).collection('history').add(history_data)

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
                    image_url = upload_to_firebase(part.inline_data.data, folder="translations")

                    history_data = {
                        "title": f"Translation to {target_lang}",
                        "type": "edulens",
                        "image_url": image_url,
                        "created_at": firestore.SERVER_TIMESTAMP
                    }
                    db.collection('users').document(uid).collection('history').add(history_data)

                    user_ref = db.collection('users').document(uid)
                    user_ref.update({"tokens_remaining": firestore.Increment(-1)})
                    
                    return StreamingResponse(io.BytesIO(part.inline_data.data), media_type="image/png")

        raise HTTPException(status_code=500, detail="No image generated")
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download")
async def download_proxy(url: str, filename: str = "download.png"):
    if "firebasestorage.googleapis.com" not in url and "appspot.com" not in url:
        raise HTTPException(status_code=400, detail="Invalid image source")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            if response.status_code != 200:
                raise HTTPException(status_code=404, detail="Image not found")
            
            return StreamingResponse(
                io.BytesIO(response.content),
                media_type="image/png",
                headers={
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
    pat = os.getenv("GITHUB_PAT")
    owner = os.getenv("GITHUB_REPO_OWNER")
    repo = os.getenv("GITHUB_REPO_NAME")
    
    if not all([pat, owner, repo]):
        logger.error("GitHub configuration missing in .env")
        raise HTTPException(status_code=500, detail="Server configuration error")

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

    url = f"https://api.github.com/repos/{owner}/{repo}/issues"
    headers = {
        "Authorization": f"token {pat}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
    }
    payload = {
        "title": issue_title,
        "body": issue_body,
        "labels": ["user-feedback"] 
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