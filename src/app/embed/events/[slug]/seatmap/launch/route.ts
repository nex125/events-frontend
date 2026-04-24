import { NextRequest } from 'next/server';

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8080/api';

function normalize(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function hasUsableValue(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0 && !value.includes('${');
}

function getApiBaseUrl(): string {
  const configured =
    (hasUsableValue(process.env.API_BASE_URL) && process.env.API_BASE_URL) ||
    (hasUsableValue(process.env.NEXT_PUBLIC_API_BASE_URL) && process.env.NEXT_PUBLIC_API_BASE_URL) ||
    DEFAULT_API_BASE_URL;

  return normalize(configured);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await context.params;
  const contentType = request.headers.get('content-type')?.trim() || 'application/x-www-form-urlencoded';
  const upstream = await fetch(`${getApiBaseUrl()}/embed/events/${encodeURIComponent(slug)}/seatmap/launch`, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      'X-Ticketok-Launch-Path': request.nextUrl.pathname,
    },
    body: await request.text(),
    cache: 'no-store',
    redirect: 'manual',
  });

  const responseBody = await upstream.text();
  const headers = new Headers();
  const responseContentType = upstream.headers.get('Content-Type');
  if (responseContentType) {
    headers.set('Content-Type', responseContentType);
  }
  const location = upstream.headers.get('Location');
  if (location) {
    headers.set('Location', location);
  }
  const setCookie = upstream.headers.get('Set-Cookie');
  if (setCookie) {
    headers.append('Set-Cookie', setCookie);
  }

  return new Response(responseBody, {
    status: upstream.status,
    headers,
  });
}
