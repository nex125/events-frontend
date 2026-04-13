import { NextResponse } from 'next/server';

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

function authHeadersOrError():
  | { ok: true; headers: Record<string, string> }
  | { ok: false; response: Response } {
  const apiKeyID = readTrimmed(process.env.BO_API_KEY_ID);
  const apiKeySecret = readTrimmed(process.env.BO_API_KEY_SECRET);
  if (apiKeyID.length === 0 || apiKeySecret.length === 0) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'BO API key credentials are not configured on frontend proxy' },
        { status: 500 },
      ),
    };
  }

  return {
    ok: true,
    headers: {
      'X-Api-Key-Id': apiKeyID,
      'X-Api-Key-Secret': apiKeySecret,
    },
  };
}

export async function proxyBoRequest({
  path,
  method,
  requestBody,
}: {
  path: string;
  method: 'GET' | 'POST';
  requestBody?: string;
}): Promise<Response> {
  const auth = authHeadersOrError();
  if (!auth.ok) {
    return auth.response;
  }

  const upstream = await fetch(`${getBoServiceBaseUrl()}${path}`, {
    method,
    headers: {
      ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
      ...auth.headers,
    },
    body: requestBody,
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
