import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API = process.env.XPAYMENTS_API_URL || 'https://api.xpayments.digital';

async function authToken() {
  return (await cookies()).get('xpay_expert_token')?.value || '';
}

async function forward(request: Request, pathParts: string[], method: 'GET'|'POST'|'PATCH') {
  const auth = await authToken();
  if (!auth) {
    return NextResponse.json({ success:false, error:{ code:'UNAUTHORIZED', message:'Autenticação necessária.' } }, { status:401 });
  }

  const incoming = new URL(request.url);
  const upstreamUrl = new URL(`${API}/api/v1/expert-ops/${pathParts.join('/')}`);
  upstreamUrl.search = incoming.search;

  const init: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${auth}`,
      Accept: 'application/json'
    },
    cache: 'no-store'
  };

  if (method !== 'GET') {
    init.headers = { ...init.headers, 'Content-Type':'application/json' };
    init.body = await request.text();
  }

  const upstream = await fetch(upstreamUrl, init);
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type':'application/json', 'Cache-Control':'no-store' }
  });
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forward(request, path || [], 'GET');
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forward(request, path || [], 'POST');
}

export async function PATCH(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forward(request, path || [], 'PATCH');
}
