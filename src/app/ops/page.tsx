import './ops.css';
import OpsClient from '@/components/ops-client';

export const metadata = {
  title: 'Expert Operations | XPay Expert',
  robots: { index: false, follow: false }
};

export default function OpsPage() {
  return <main className="portal">
    <div className="ops-shell" style={{marginBottom:14,display:'flex',justifyContent:'flex-end'}}>
      <a className="btn" href="/ops/intake">Documentos & Comprovativos →</a>
    </div>
    <OpsClient />
  </main>;
}
