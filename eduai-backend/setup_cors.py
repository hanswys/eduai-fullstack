import os
import firebase_admin
from firebase_admin import credentials, storage
from dotenv import load_dotenv

# Load your environment variables to get the bucket name
load_dotenv()

# 1. Initialize Firebase Admin
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

# 2. Get the Bucket
bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET")
bucket = storage.bucket(bucket_name)

print(f"Configuring CORS for bucket: {bucket_name}...")

# 3. Define the CORS configuration
# This allows your Next.js app (localhost:3000) to access the images via fetch()
cors_configuration = [
    {
        "origin": ["http://localhost:3000"],  # Add your production domain here later! e.g., "https://myapp.vercel.app"
        "method": ["GET"],
        "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
        "maxAgeSeconds": 3600
    }
]

# 4. Apply the configuration
try:
    bucket.cors = cors_configuration
    bucket.patch()
    print("✅ Success! CORS configuration has been updated.")
    print("Your frontend can now download images directly.")
except Exception as e:
    print(f"❌ Error setting CORS: {e}")
    