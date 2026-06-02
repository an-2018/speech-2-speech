import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { targetLanguage } = await request.json();

    if (!targetLanguage) {
      return NextResponse.json(
        { error: 'targetLanguage is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      'https://api.openai.com/v1/realtime/translations/client_secrets',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session: {
            model: 'gpt-realtime-translate',
            audio: {
              output: {
                language: targetLanguage,
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: 'Failed to create translation session', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ clientSecret: data.client_secret?.value || data.value });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}