import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API = process.env.XPAYMENTS_API_URL || 'https://api.xpayments.digital';

async function token() { return (await cookies()).get('xpay_expert_token')?.value || ''; }

export async function GET() {
  const auth = await token();
  if (!auth) return NextResponse.json({ success:false, error:{ code:'UNAUTHORIZED', message:'Autenticação necessária.' } }, { status:401 });
  const upstream = await fetch(`${API}/api/v1/expert/orders`, { headers:{ Authorization:`Bearer ${auth}` }, cache:'no-store' });
  const text = await upstream.text();
  return new NextResponse(text, { status: upstream.status, headers:{ 'Content-Type':'application/json' } });
}

export async function POST(request: Request) {
  const auth = await token();
  if (!auth) return NextResponse.json({ success:false, error:{ code:'UNAUTHORIZED', message:'Autenticação necessária.' } }, { status:401 });
  const body = await request.json();
  const upstream = await fetch(`${API}/api/v1/expert/orders`, { method:'POST', headers:{ Authorization:`Bearer ${auth}`, 'Content-Type':'application/json' }, body:JSON.stringify(body), cache:'no-store' });
  const text = await upstream.text();
  return new NextResponse(text, { status: upstream.status, headers:{ 'Content-Type':'application/json' } });
}
