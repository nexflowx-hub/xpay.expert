import OpsClient from '@/components/ops-client';

export const metadata = {
  title: 'Expert Operations | XPay Expert',
  robots: { index: false, follow: false }
};

export default function OpsPage() {
  return <main className="portal"><OpsClient /></main>;
}
