import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://xpay.expert'),
  title: { default: 'XPay Expert — Business & Payments Infrastructure', template: '%s | XPay Expert' },
  description: 'Estruturação empresarial, banking, acquiring e infraestrutura integrada ao ecossistema XPayments.',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt"><body>
    <header className="nav"><div className="shell navin">
      <Link href="/" className="brand">XPAY<span>.EXPERT</span></Link>
      <nav className="navlinks">
        <Link href="/#services">Serviços</Link>
        <Link href="/#process">Como funciona</Link>
        <Link href="https://www.xpayments.digital/doc">Documentação XPAYMENTS</Link>
        <Link className="btn ghost" href="/portal">Área Merchant</Link>
      </nav>
    </div></header>
    {children}
    <footer className="footer"><div className="shell footergrid">
      <div><strong>XPAY.EXPERT</strong><br/>Business, payments & infrastructure operations.</div>
      <div>Operações sujeitas a KYC/KYB, elegibilidade e aprovação de instituições terceiras.<br/>Contato: <a className="wa" href="https://wa.me/351925386409">+351 925 386 409</a></div>
    </div></footer>
  </body></html>;
}
