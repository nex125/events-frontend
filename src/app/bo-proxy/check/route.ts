import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_BO_SERVICE_BASE_URL = 'http://bo-service:5175';

function normalize(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function readTrimmed(value: string | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getBoServiceBaseUrl(): string {
  const configured = readTrimmed(process.env.BO_SERVICE_BASE_URL);
  return configured.length > 0 ? normalize(configured) : DEFAULT_BO_SERVICE_BASE_URL;
}

export async function POST(request: NextRequest): Promise<Response> {
  const apiKeyID = readTrimmed(process.env.BO_API_KEY_ID);
  const apiKeySecret = readTrimmed(process.env.BO_API_KEY_SECRET);
  if (apiKeyID.length === 0 || apiKeySecret.length === 0) {
    return NextResponse.json(
      { error: 'BO API key credentials are not configured on frontend proxy' },
      { status: 500 },
    );
  }

  const upstream = await fetch(`${getBoServiceBaseUrl()}/api/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key-Id': apiKeyID,
      'X-Api-Key-Secret': apiKeySecret,
    },
    body: await request.text(),
    cache: 'no-store',
  });

  const responseBody = await upstream.text();
  const contentType = upstream.headers.get('Content-Type') ?? 'application/json';
  return new Response(responseBody, {
    status: upstream.status,
    headers: {
      'Content-Type': contentType,
    },
  });
}
