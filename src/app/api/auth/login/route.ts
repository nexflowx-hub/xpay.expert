import { NextResponse } from 'next/server';

const API = process.env.XPAYMENTS_API_URL || 'https://api.xpayments.digital';

export async function POST(request: Request) {
  const body = await request.json();
  const upstream = await fetch(`${API}/api/v1/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store'
  });
  const payload = await upstream.json().catch(() => ({ success: false, error: { message: 'Resposta inválida do XPAYMENTS.' } }));
  const response = NextResponse.json(payload, { status: upstream.status });
  const token = payload?.data?.token;
  if (upstream.ok && token) response.cookies.set('xpay_expert_token', token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 });
  return response;
}
