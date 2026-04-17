import { NextRequest, NextResponse } from 'next/server';
import { proxyBoRequest } from '../../_shared';

export async function GET(request: NextRequest): Promise<Response> {
  const venueId = request.nextUrl.searchParams.get('venueId')?.trim() ?? '';
  const eventId = request.nextUrl.searchParams.get('eventId')?.trim() ?? '';
  if (venueId.length === 0) {
    return NextResponse.json({ error: 'venueId is required' }, { status: 400 });
  }

  const query = new URLSearchParams({ venueId });
  if (eventId.length > 0) {
    query.set('eventId', eventId);
  }

  return proxyBoRequest({
    path: `/api/products/snapshot?${query.toString()}`,
    method: 'GET',
  });
}
