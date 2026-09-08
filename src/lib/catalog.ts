import { services, type ServiceOffering } from './services';

const API = process.env.XPAYMENTS_API_URL || 'https://api.xpayments.digital';

type ApiOffering = {
  code: string;
  slug: string;
  name: string;
  description?: string | null;
  jurisdiction?: string | null;
  baseCurrency?: string | null;
  prices?: Record<string, number | string>;
  managementFeePercent?: number;
  leadTime?: string | null;
  availabilityLimit?: number | null;
  availabilityRemaining?: number | null;
  available?: boolean;
  metadata?: { premium?: boolean; includes?: string[] };
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

function mapOffering(item: ApiOffering): ServiceOffering {
  const limit = item.availabilityLimit;
  const remaining = item.availabilityRemaining;
  const availability = limit == null
    ? undefined
    : `Disponíveis: ${remaining ?? limit} de ${limit}`;

  return {
    slug: item.slug,
    code: item.code,
    name: item.name,
    subtitle: item.description || 'Serviço operacional XPay Expert.',
    jurisdiction: item.jurisdiction || 'Internacional',
    currency: item.baseCurrency || 'EUR',
    prices: {
      EUR: toNumber(item.prices?.EUR),
      BRL: toNumber(item.prices?.BRL),
      USDT: toNumber(item.prices?.USDT)
    },
    managementFeePercent: toNumber(item.managementFeePercent),
    leadTime: item.leadTime || 'Sob validação documental e KYC/KYB',
    availability,
    premium: Boolean(item.metadata?.premium),
    highlights: Array.isArray(item.metadata?.includes) ? item.metadata!.includes! : []
  };
}

export async function getCatalog(): Promise<ServiceOffering[]> {
  try {
    const response = await fetch(`${API}/api/v1/expert/offerings`, {
      next: { revalidate: 60 },
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) return services;
    const payload = await response.json();
    const rows: ApiOffering[] = payload?.data?.offerings || [];
    if (!rows.length) return services;
    return rows.map(mapOffering);
  } catch {
    return services;
  }
}
