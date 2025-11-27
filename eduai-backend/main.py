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


PRO_MODEL_ID = "gemini-3-pro-image-preview"
# PRO_MODEL_ID = "gemini-2.5-flash"

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
        model=PRO_MODEL_ID,
        contents=[prompt],
        )

        for part in response.parts:
            if part.text is not None:
                print(part.text)
            elif part.inline_data is not None:
                # Get raw bytes directly from inline_data
                image_bytes = part.inline_data.data
                
                # Save to disk for debugging (optional)
                try:
                    with open("images/generated_image.png", "wb") as f:
                        f.write(image_bytes)
                except Exception as e:
                    print(f"Error saving to disk: {e}")
                
                # Return raw bytes directly to frontend
                return StreamingResponse(io.BytesIO(image_bytes), media_type="image/png")
        
        # If no image was found in the response, raise an error
        raise HTTPException(
            status_code=500,
            detail="No image was generated in the response"
        )

    except HTTPException:
        raise

    except Exception as e:
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

        # 3. Call the API using the new syntax
        # Note: We use 'gemini-2.0-flash-exp' as it is the current standard for 
        # image-in/image-out. You can swap this string if you have access to others.
        response = client.models.generate_content(
            model=PRO_MODEL_ID,
            contents=[prompt, input_image],
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE'],
                temperature=0.4, # Lower temperature for more accurate translation/reproduction
            )
        )

        # 4. Iterate through parts to find the image
        # Using the exact syntax you requested: if image := part.as_image()
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                # Prefer raw inline data bytes if available (avoids save() quirks)
                if part.inline_data and part.inline_data.data:
                    image_bytes = part.inline_data.data
                    
                    # Optional: persist to disk for debugging
                    try:
                        with open("images/visual_translation_output.png", "wb") as f:
                            f.write(image_bytes)
                    except Exception as disk_error:
                        print(f"Failed to write debug image: {disk_error}")
                    
                    return StreamingResponse(
                        io.BytesIO(image_bytes),
                        media_type=part.inline_data.mime_type or "image/png",
                    )
                
                # Fallback: attempt to convert helper image to bytes
                if image := part.as_image():
                    buffer = io.BytesIO()
                    image.save(buffer, "PNG")
                    buffer.seek(0)
                    return StreamingResponse(buffer, media_type="image/png")

        # If loop finishes without finding an image
        raise HTTPException(status_code=500, detail="Model generated text but no image.")

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# @app.post("/api/translate-image")
# async def translate_image(
#     file: UploadFile = File(...), 
#     lang: str = Form(...)
# ):
#     print(file)
#     print(lang)

#     # """
#     # 1. Receives an image.
#     # 2. Sends image + language 
#     # 3. Returns the translated text in the image.
#     # """
#     # try:
#     #     # Read image file
#     #     contents = await file.read()
#     #     image = Image.open(io.BytesIO(contents))

#     #     prompt = f"""
#     #     Look at this image. 
#     #     1. Identify the text in the image.
#     #     2. Translate that text into {lang}, keeping everything else the same.
#     #     """

#     #     response = model.generate_content([prompt, image])
        
#     #     return {"translated_text": response.text}

#     # except Exception as e:
#     #     print(e)
#     #     raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)