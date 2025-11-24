import { NextResponse } from 'next/server';

const MAX_LENGTH = 5000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const { text } = await request.json().catch(() => ({}));

    if (typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ detail: 'Text is required' }, { status: 400 });
    }

    if (text.length > MAX_LENGTH) {
      return NextResponse.json(
        { detail: `Text must be less than ${MAX_LENGTH} characters` },
        { status: 413 }
      );
    }

    const backendResponse = await fetch(`${BACKEND_URL}/api/visual-notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!backendResponse.ok) {
      const errorPayload = await backendResponse.json().catch(() => null);
      const detail =
        typeof errorPayload?.detail === 'string'
          ? errorPayload.detail
          : 'Failed to generate visual notes';

      return NextResponse.json({ detail }, { status: backendResponse.status });
    }

    const contentType =
      backendResponse.headers.get('content-type') || 'application/octet-stream';

    // Convert the streamed response into a Buffer so Next.js can return it downstream.
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

