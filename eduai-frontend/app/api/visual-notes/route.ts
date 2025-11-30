import { NextResponse } from 'next/server';

const MAX_LENGTH = 5000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const { text } = await request.json().catch(() => ({}));

    // 1. EXTRACT THE TOKEN FROM THE INCOMING REQUEST
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ detail: 'Authentication required' }, { status: 401 });
    }

    if (typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ detail: 'Text is required' }, { status: 400 });
    }

    if (text.length > MAX_LENGTH) {
      return NextResponse.json(
        { detail: `Text must be less than ${MAX_LENGTH} characters` },
        { status: 413 }
      );
    }

    // 2. FORWARD THE TOKEN TO YOUR PYTHON BACKEND
    const backendResponse = await fetch(`${BACKEND_URL}/api/visual-notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader, // <--- THIS WAS MISSING
      },
      body: JSON.stringify({ text }),
    });

    if (!backendResponse.ok) {
      const errorPayload = await backendResponse.json().catch(() => null);
      const detail =
        typeof errorPayload?.detail === 'string'
          ? errorPayload.detail
          : 'Failed to generate visual notes';

      // Pass the actual status code from backend (e.g., 402 for no tokens)
      return NextResponse.json({ detail }, { status: backendResponse.status });
    }

    const contentType =
      backendResponse.headers.get('content-type') || 'application/octet-stream';

    const buffer = Buffer.from(await backendResponse.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
        'Content-Disposition':
          backendResponse.headers.get('content-disposition') ??
          'inline; filename="visual-notes.png"',
      },
    });
  } catch (error) {
    console.error('visual-notes route error', error);
    return NextResponse.json(
      { detail: 'Failed to generate visual notes' },
      { status: 500 }
    );
  }
}