import type { Metadata } from 'next';
import Link from 'next/link';
import XPayAssist from '@/components/xpay-assist';
import './globals.css';
import './marketing-v2.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://xpay.expert'),
  title: { default: 'XPay Expert — Business & Payments Infrastructure', template: '%s | XPay Expert' },
  description: 'Estruturação empresarial, banking, acquiring, infraestrutura digital e operações internacionais integradas ao ecossistema XPayments.',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt"><body>
    <header className="nav"><div className="shell navin">
      <Link href="/" className="brand">XPAY<span>.EXPERT</span></Link>
      <nav className="navlinks">
        <Link href="/#services">Serviços</Link>
        <Link href="/#custom">Projetos personalizados</Link>
        <Link href="/#process">Como funciona</Link>
        <Link className="btn primary" href="/register">Criar conta Merchant</Link>
        <Link className="btn ghost" href="/portal">Área Merchant</Link>
      </nav>
    </div></header>
    {children}
    <footer className="footer"><div className="shell footergrid">
      <div><strong>XPAY.EXPERT</strong><br/>Business, payments & infrastructure operations.</div>
      <div>Estruturas dedicadas, projetos internacionais e operações personalizadas.<br/>Contato: <a className="wa" href="https://wa.me/351925386409">+351 925 386 409</a></div>
    </div></footer>
    <XPayAssist />
  </body></html>;
}
