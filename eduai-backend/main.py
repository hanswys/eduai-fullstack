import os
import io
import logging
import time
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from PIL import Image
from google.genai import types
from google import genai

# --- Logging Configuration ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("backend")

# Load environment variables
load_dotenv()

# Configure Gemini
GENAI_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GENAI_API_KEY:
    logger.critical("GOOGLE_API_KEY not found in .env file")
    raise ValueError("GOOGLE_API_KEY not found in .env file")

PRO_MODEL_ID = "gemini-3-pro-image-preview"
# PRO_MODEL_ID = "gemini-2.5-flash"

logger.info(f"Initializing Gemini Client with model: {PRO_MODEL_ID}")
client = genai.Client(api_key=GENAI_API_KEY)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Models ---
class TextRequest(BaseModel):
    text: str

# --- Helper Function ---
def get_image_bytes(file: UploadFile) -> bytes:
    return file.file.read()

# --- Middleware for Request Timing ---
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"Path: {request.url.path} | Method: {request.method} | Status: {response.status_code} | Time: {process_time:.2f}s")
    return response

# --- Routes ---

@app.get("/")
def health_check():
    logger.info("Health check requested.")
    return {"status": "active", "model": PRO_MODEL_ID}

@app.post("/api/visual-notes")
async def generate_visual_notes(request: TextRequest):
    """
    1. Analyzes the user's transcript.
    2. Generates an illustrative diagram.
    3. Returns the image bytes so the frontend can render it directly.
    """
    logger.info(f"Received visual notes request. Text length: {len(request.text)} characters.")
    
    try:
        prompt = f"""
        Analyze the following transcript and create an image that maps all the key ideas together.
        Transcript: {request.text}
        """

        logger.info(f"Sending request to Gemini model ({PRO_MODEL_ID})...")
        
        response = client.models.generate_content(
            model=PRO_MODEL_ID,
            contents=[prompt],
        )

        logger.info("Gemini response received. Processing parts...")

        for part in response.parts:
            if part.text is not None:
                logger.info(f"Model generated text (logging first 100 chars): {part.text[:100]}...")
            elif part.inline_data is not None:
                logger.info("Model generated inline image data.")
                
                # Get raw bytes directly from inline_data
                image_bytes = part.inline_data.data
                
                # Save to disk for debugging (optional)
                try:
                    os.makedirs("images", exist_ok=True) # Ensure directory exists
                    save_path = "images/generated_image.png"
                    with open(save_path, "wb") as f:
                        f.write(image_bytes)
                    logger.info(f"Debug image saved to {save_path}")
                except Exception as e:
                    logger.warning(f"Error saving to disk: {e}")
                
                # Return raw bytes directly to frontend
                logger.info("Streaming image response to client.")
                return StreamingResponse(io.BytesIO(image_bytes), media_type="image/png")
        
        # If no image was found in the response
        logger.error("No image found in Gemini response parts.")
        raise HTTPException(
            status_code=500,
            detail="No image was generated in the response"
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Unexpected error in generate_visual_notes: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/visual-translation")
async def generate_visual_translation(
    file: UploadFile = File(...), 
    target_lang: str = Form(...)
):
    """
    1. Receives an image and a target language.
    2. Uses Gemini to regenerate the image with translated text.
    3. Returns the image bytes to the frontend.
    """
    logger.info(f"Received visual translation request. Target Language: {target_lang}. Filename: {file.filename}")

    try:
        # 1. Read and Process the Input Image
        file_bytes = await file.read()
        input_image = Image.open(io.BytesIO(file_bytes))
        logger.info(f"Image loaded successfully. Size: {input_image.size}, Format: {input_image.format}")

        # 2. Construct the Prompt
        prompt = f"""
        Act as a professional translator and graphic designer.
        Analyze the provided image. 
        Generate a new image that is visually identical to the original, 
        but translate all text, labels, and headers into {target_lang}.
        Maintain the original layout and style perfectly.
        """

        # 3. Call the API using the new syntax
        logger.info(f"Sending image + prompt to Gemini model ({PRO_MODEL_ID})...")
        
        response = client.models.generate_content(
            model=PRO_MODEL_ID,
            contents=[prompt, input_image],
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE'],
                temperature=0.4, 
            )
        )
        
        logger.info("Gemini response received. Processing parts...")

        # 4. Iterate through parts to find the image
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                
                # Check for text (logging it might explain why image wasn't generated)
                if part.text:
                    logger.info(f"Gemini returned text: {part.text[:200]}...")

                # Prefer raw inline data bytes if available
                if part.inline_data and part.inline_data.data:
                    logger.info("Found inline_data image in response.")
                    image_bytes = part.inline_data.data
                    
                    # Optional: persist to disk for debugging
                    try:
                        os.makedirs("images", exist_ok=True)
                        save_path = "images/visual_translation_output.png"
                        with open(save_path, "wb") as f:
                            f.write(image_bytes)
                        logger.info(f"Debug image saved to {save_path}")
                    except Exception as disk_error:
                        logger.warning(f"Failed to write debug image: {disk_error}")
                    
                    return StreamingResponse(
                        io.BytesIO(image_bytes),
                        media_type=part.inline_data.mime_type or "image/png",
                    )
                
                # Fallback: attempt to convert helper image to bytes
                if image := part.as_image():
                    logger.info("Found generated image using .as_image() helper.")
                    buffer = io.BytesIO()
                    image.save(buffer, "PNG")
                    buffer.seek(0)
                    return StreamingResponse(buffer, media_type="image/png")

        # If loop finishes without finding an image
        logger.error("Model generated response but no valid image part was found.")
        raise HTTPException(status_code=500, detail="Model generated text but no image.")

    except Exception as e:
        logger.error(f"Unexpected error in generate_visual_translation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting FastAPI server on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)