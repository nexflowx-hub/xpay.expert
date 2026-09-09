import '../ops.css';
import './intake.css';
import OpsIntakeClient from '@/components/ops-intake-client';

export const metadata = {
  title: 'Documentos & Comprovativos | XPay Expert',
  robots: { index: false, follow: false }
};

export default function OpsIntakePage(){
  return <main className="portal"><OpsIntakeClient /></main>;
}
