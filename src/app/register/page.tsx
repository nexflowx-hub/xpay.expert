import './signup.css';
import RegisterMerchantClient from '@/components/register-merchant-client';

export const metadata = {
  title: 'Criar conta Merchant | XPay Expert',
  description: 'Crie a sua conta Merchant XPAYMENTS e avance diretamente para a contratação XPay.Expert.',
  robots: { index: true, follow: true }
};

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<{ service?: string }>
}) {
  const query = await searchParams;
  return <main className="signup-page">
    <div className="shell">
      <RegisterMerchantClient initialService={query?.service} />
    </div>
  </main>;
}
