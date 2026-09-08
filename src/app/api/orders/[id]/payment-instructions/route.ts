import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API = process.env.XPAYMENTS_API_URL || 'https://api.xpayments.digital';

async function token() {
  return (await cookies()).get('xpay_expert_token')?.value || '';
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await token();
  if (!auth) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Autenticação necessária.' } },
      { status: 401 }
    );
  }

  const { id } = await params;
  const upstream = await fetch(
    `${API}/api/v1/expert/orders/${encodeURIComponent(id)}/payment-instructions`,
    {
      headers: { Authorization: `Bearer ${auth}`, Accept: 'application/json' },
      cache: 'no-store'
    }
  );

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' }
  });
}
