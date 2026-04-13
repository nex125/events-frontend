import { NextRequest, NextResponse } from 'next/server';
import { proxyBoRequest } from '../../_shared';

export async function GET(request: NextRequest): Promise<Response> {
  const venueId = request.nextUrl.searchParams.get('venueId')?.trim() ?? '';
  if (venueId.length === 0) {
    return NextResponse.json({ error: 'venueId is required' }, { status: 400 });
  }

  return proxyBoRequest({
    path: `/api/products/snapshot?venueId=${encodeURIComponent(venueId)}`,
    method: 'GET',
  });
}
