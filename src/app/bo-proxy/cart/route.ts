import { NextRequest } from 'next/server';
import { proxyBoRequest } from '../_shared';

export async function POST(request: NextRequest): Promise<Response> {
  return proxyBoRequest({
    path: '/api/cart',
    method: 'POST',
    requestBody: await request.text(),
  });
}
