import os
import io
import logging
import time
from typing import Optional, List
from datetime import date, datetime, timedelta, timezone

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request, Depends, status, Security
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from dotenv import load_dotenv
from PIL import Image
from google.genai import types
from google import genai

# --- FIREBASE ADMIN IMPORTS ---
import firebase_admin
from firebase_admin import auth, credentials

# --- DATABASE IMPORTS ---
from sqlmodel import SQLModel, Field, Relationship, Session, create_engine, select

# --- Logging Configuration ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("backend")

# Load environment variables
load_dotenv()

# --- FIREBASE ADMIN INITIALIZATION ---
try:
    if os.path.exists("serviceAccountKey.json"):
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin initialized with serviceAccountKey.json")
    else:
        logger.warning("serviceAccountKey.json not found. Auth verification will fail unless mocked.")
except ValueError:
    pass # App already initialized

# Configure Gemini (API key is loaded from .env)
GENAI_API_KEY = os.getenv("GOOGLE_API_KEY")
MODEL_ID = "gemini-2.5-flash"
PRO_MODEL_ID = "gemini-3-pro-image-preview"


# --- DATABASE CONFIGURATION ---
DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite:///./database.db"
engine = create_engine(DATABASE_URL, echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATABASE MODELS ---

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    firebase_uid: str = Field(index=True, unique=True, nullable=False)
    email: str = Field(index=True)
    
    tokens_remaining: int = Field(default=5, nullable=False)
    streak_count: int = Field(default=0, nullable=False)
    last_activity_date: Optional[date] = Field(default=None, nullable=True)

    images: List["ImageGeneration"] = Relationship(back_populates="user")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ImageGeneration(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    image_url: str = Field(nullable=False)
    prompt: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: int = Field(foreign_key="user.id")
    user: Optional[User] = Relationship(back_populates="images")

# --- SCHEMAS ---

class UserProfileResponse(BaseModel):
    uid: str
    email: str
    tokens_remaining: int
    streak_count: int

class TextRequest(BaseModel):
    text: str

# --- AUTH DEPENDENCY ---
security = HTTPBearer()

async def get_current_user(
    creds: HTTPAuthorizationCredentials = Security(security),
    session: Session = Depends(get_session)
) -> User:
    """
    Verifies the Firebase ID Token and returns the DB User.
    Creates the user in DB if they don't exist (Upsert logic).
    """
    token = creds.credentials
    try:
        # 1. Verify token with Firebase Admin SDK
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        email = decoded_token.get('email', 'no-email@provided.com')
        
    except Exception as e:
        logger.error(f"Authentication failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. Check DB
    statement = select(User).where(User.firebase_uid == uid)
    user = session.exec(statement).first()
    
    # 3. Create if new
    if not user:
        logger.info(f"Creating new user in DB: {email}")
        user = User(firebase_uid=uid, email=email)
        session.add(user)
        session.commit()
        session.refresh(user)
        
    return user

# --- STARTUP ---
@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    global client
    if GENAI_API_KEY:
        client = genai.Client(api_key=GENAI_API_KEY)
        logger.info("Gemini Client initialized.")

# --- ROUTES ---

@app.get("/")
def health_check():
    return {"status": "active"}

# [NEW] Endpoint to fetch real user data on login
@app.get("/users/me", response_model=UserProfileResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user's profile and credits."""
    return {
        "uid": current_user.firebase_uid,
        "email": current_user.email,
        "tokens_remaining": current_user.tokens_remaining,
        "streak_count": current_user.streak_count
    }

@app.post("/api/visual-notes")
async def generate_visual_notes(
    request: TextRequest, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Analyzes text, generates an image, deducts a token, and returns the image.
    """
    if current_user.tokens_remaining <= 0:
         raise HTTPException(status_code=402, detail="Insufficient tokens")

    # Log token deduction attempt
    logger.info(f"User {current_user.email} attempting generation. Tokens before: {current_user.tokens_remaining}")
    
    try:
        # 1. Setup Prompt
        prompt = f"Analyze the following transcript and create an image that maps all the key ideas together. Transcript: {request.text}"
        
        # 2. Call Gemini
        response = client.models.generate_content(
            model=PRO_MODEL_ID,
            contents=[prompt],
        )
        
        # 3. Extract Image and Deduct Token
        for part in response.parts:
            if part.inline_data:
                 # Deduct token immediately upon successful generation
                 current_user.tokens_remaining -= 1
                 session.add(current_user)
                 session.commit()
                 session.refresh(current_user)
                 
                 logger.info(f"Generation successful. Tokens remaining: {current_user.tokens_remaining}")
                 return StreamingResponse(io.BytesIO(part.inline_data.data), media_type="image/png")
        
        # If no image found, raise error
        raise HTTPException(status_code=500, detail="No image generated by the AI model.")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in generate_visual_notes: {str(e)}", exc_info=True)
        # In a robust system, you might implement a refund logic here if the deduction was optimistic
        raise HTTPException(status_code=500, detail=f"Failed to process request: {str(e)}")


@app.post("/api/visual-translation")
async def generate_visual_translation(
    file: UploadFile = File(...), 
    target_lang: str = Form(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Receives an image, translates the text, deducts a token, and returns the translated image.
    """
    if current_user.tokens_remaining <= 0:
         raise HTTPException(status_code=402, detail="Insufficient tokens")

    logger.info(f"User {current_user.email} attempting translation to {target_lang}.")

    try:
        # 1. Read and Process the Input Image
        file_bytes = await file.read()
        input_image = Image.open(io.BytesIO(file_bytes))

        # 2. Construct the Prompt
        prompt = f"""
        Act as a professional translator and graphic designer.
        Analyze the provided image. 
        Generate a new image that is visually identical to the original, 
        but translate all text, labels, and headers into {target_lang}.
        Maintain the original layout and style perfectly.
        """

        # 3. Call the API
        response = client.models.generate_content(
            model=PRO_MODEL_ID,
            contents=[prompt, input_image],
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE'],
                temperature=0.4, 
            )
        )
        
        # 4. Extract Image and Deduct Token
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                
                if part.inline_data and part.inline_data.data:
                    # Deduct token upon successful generation
                    current_user.tokens_remaining -= 1
                    session.add(current_user)
                    session.commit()
                    session.refresh(current_user)
                    logger.info(f"Translation successful. Tokens remaining: {current_user.tokens_remaining}")
                    
                    return StreamingResponse(
                        io.BytesIO(part.inline_data.data),
                        media_type=part.inline_data.mime_type or "image/png",
                    )

        # If loop finishes without finding an image
        raise HTTPException(status_code=500, detail="Model generated text but no image was provided.")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in generate_visual_translation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process request: {str(e)}")

@app.post("/test/set-tokens/{new_tokens:int}")
def set_tokens_for_test(
    new_tokens: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user) # Ensures you are modifying your own user
):
    """Temporarily sets the current user's tokens for testing."""
    current_user.tokens_remaining = new_tokens
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return {"message": f"Tokens set to {new_tokens}", "tokens_remaining": current_user.tokens_remaining}

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting FastAPI server on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)