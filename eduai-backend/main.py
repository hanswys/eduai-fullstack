import os
import io
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from PIL import Image
from google.genai import types
from google import genai

# Load environment variables
load_dotenv()

# Configure Gemini
# Get your key from https://aistudio.google.com/
GENAI_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GENAI_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in .env file")


# PRO_MODEL_ID = "gemini-3-pro-image-preview"
PRO_MODEL_ID = "gemini-2.5-flash"

# We use 1.5 Flash because it is fast and supports images (Multimodal)
client = genai.Client(api_key=GENAI_API_KEY)

app = FastAPI()

# Enable CORS so your Next.js frontend can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Allow your frontend
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

# --- Routes ---

@app.get("/")
def health_check():
    return {"status": "active", "model": "Gemini 1.5 Flash"}

@app.post("/api/visual-notes")
async def generate_visual_notes(request: TextRequest):
    aspect_ratio = "16:9"
    """
    1. Analyzes the user's transcript.
    2. Generates an illustrative diagram.
    3. Returns the image bytes so the frontend can render it directly.
    """
    try:
        prompt = f"""
        Analyze the following transcript and create an image that maps all the key ideas together.
        Transcript: {request.text}
        """
        # print(request.text)

        # response = client.models.generate_content(
        #     model=PRO_MODEL_ID,
        #     contents=prompt,
        #     config=types.GenerateContentConfig(
        #         response_modalities=["Text", "Image"],
        #         image_config=types.ImageConfig(aspect_ratio=aspect_ratio),
        #         thinking_config=types.ThinkingConfig(include_thoughts=True),
        #     ),
        # )

        # for part in response.parts:
        #     if part.thought:
        #         # Helpful to keep the log but avoid leaking sensitive data
        #         print(f"Thought: {part.text}")
        #         continue

            # image = part.as_image()
            # if image:
            #     buffer = io.BytesIO()
            #     image.save("test.png")
            #     image.save(buffer, format="PNG")
            #     buffer.seek(0)
            #     return StreamingResponse(buffer, media_type="image/png")
        response = client.models.generate_content(
        model="gemini-2.5-flash-image",
        contents=[prompt],
        )

        for part in response.parts:
            if part.text is not None:
                print(part.text)
            elif part.inline_data is not None:
                image = part.as_image()
                image.save("generated_image.png")
        
        # test_image_path = os.path.join(os.path.dirname(__file__), "maui.jpg")
        # if not os.path.exists(test_image_path):
        #     raise HTTPException(
        #         status_code=404,
        #         detail="Test image not found on server.",
        #     )

        # with Image.open(test_image_path) as img:
        #     buffer = io.BytesIO()
        #     img.save(buffer, format="PNG")
        #     buffer.seek(0)
        #     return StreamingResponse(buffer, media_type="image/png")

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/translate-image")
async def translate_image(
    file: UploadFile = File(...), 
    lang: str = Form(...)
):
    print(file)
    print(lang)

    # """
    # 1. Receives an image.
    # 2. Sends image + language 
    # 3. Returns the translated text in the image.
    # """
    # try:
    #     # Read image file
    #     contents = await file.read()
    #     image = Image.open(io.BytesIO(contents))

    #     prompt = f"""
    #     Look at this image. 
    #     1. Identify the text in the image.
    #     2. Translate that text into {lang}, keeping everything else the same.
    #     """

    #     response = model.generate_content([prompt, image])
        
    #     return {"translated_text": response.text}

    # except Exception as e:
    #     print(e)
    #     raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)