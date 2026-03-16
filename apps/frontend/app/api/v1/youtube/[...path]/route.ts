import { NextRequest } from 'next/server';
import { proxyToBackend } from '../../../../../lib/api-proxy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  return proxyToBackend(request, `/v1/youtube/${path}`);
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  return proxyToBackend(request, `/v1/youtube/${path}`, 'POST');
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  return proxyToBackend(request, `/v1/youtube/${path}`, 'PATCH');
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  return proxyToBackend(request, `/v1/youtube/${path}`, 'DELETE');
}
