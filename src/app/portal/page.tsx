import PortalClient from '@/components/portal-client';

export const metadata = { title: 'Área Merchant' };

export default async function PortalPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const params = await searchParams;
  return <main className="portal"><PortalClient initialService={params.service} /></main>;
}
