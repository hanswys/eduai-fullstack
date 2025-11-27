import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    // 1. Parse the incoming FormData (File + Fields)
    const formData = await request.formData();
    const file = formData.get('file');
    const targetLang = formData.get('target_lang');

    // 2. Basic Validation
    if (!file || !targetLang) {
      return NextResponse.json(
        { detail: 'File and target_lang are required' }, 
        { status: 400 }
      );
    }

    // 3. Create a new FormData to forward to backend
    // We can't reuse the original FormData because the stream has been consumed
    const forwardFormData = new FormData();
    forwardFormData.append('file', file as File);
    forwardFormData.append('target_lang', targetLang as string);

    console.log('Forwarding request to backend:', {
      fileName: (file as File)?.name,
      fileSize: (file as File)?.size,
      targetLang: targetLang,
      backendUrl: `${BACKEND_URL}/api/visual-translation`
    });

    // 4. Forward request to FastAPI
    // Note: When sending FormData with fetch, do NOT set 'Content-Type'. 
    // The browser/fetch automatically sets the correct boundary headers.
    const backendResponse = await fetch(`${BACKEND_URL}/api/visual-translation`, {
      method: 'POST',
      body: forwardFormData, 
    });

    console.log('Backend response status:', backendResponse.status);

    // 5. Handle Errors from Backend
    if (!backendResponse.ok) {
      // Try to get error message from backend
      let errorDetail = 'Failed to translate image';
      try {
        const errorPayload = await backendResponse.json();
        errorDetail = errorPayload?.detail || errorPayload?.error || errorDetail;
        console.error('Backend error:', errorDetail);
      } catch (e) {
        // If response is not JSON, try to get text
        const errorText = await backendResponse.text().catch(() => '');
        console.error('Backend error (non-JSON):', errorText);
        errorDetail = errorText || errorDetail;
      }

      return NextResponse.json(
        { detail: errorDetail }, 
        { status: backendResponse.status }
      );
    }

    // 6. Stream the Image Back
    const contentType =
      backendResponse.headers.get('content-type') || 'image/png';

    const buffer = Buffer.from(await backendResponse.arrayBuffer());
    console.log('Successfully received image from backend, size:', buffer.length);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
        'Content-Disposition': 'inline; filename="translated-image.png"',
      },
    });

  } catch (error) {
    console.error('visual-translation route error:', error);
    return NextResponse.json(
      { 
        detail: error instanceof Error 
          ? error.message 
          : 'Internal Server Error' 
      },
      { status: 500 }
    );
  }
}