export type ServiceOffering = {
  slug: string;
  code: string;
  name: string;
  subtitle: string;
  jurisdiction: string;
  flag: string;
  currency: string;
  prices: { EUR: number; BRL: number; USDT: number };
  managementFeePercent: number;
  leadTime: string;
  availability?: string;
  premium?: boolean;
  settlementLabel?: string;
  highlights: string[];
};

export const services: ServiceOffering[] = [
  {
    slug: 'uk-ltd-eur', code: 'UK-LTD-EUR', name: 'Estrutura Dedicada EURO — UK LTD',
    subtitle: 'Entidade dedicada com infraestrutura própria para operação internacional.', jurisdiction: 'Reino Unido', flag: '🇬🇧', currency: 'EUR',
    prices: { EUR: 500, BRL: 3000, USDT: 500 }, managementFeePercent: 20,
    leadTime: 'Entrega prevista entre 3 e 5 dias após validação documental e KYC/KYB', availability: 'Disponíveis: 12 de 12',
    highlights: ['UK LTD dedicada', 'Apoio a conta bancária para payout', 'Domínio próprio', 'VPS dedicada para API', 'Número de celular UK', 'Preparação de Store XPAYMENTS']
  },
  {
    slug: 'fr-sas-eur', code: 'FR-SAS-EUR', name: 'Estrutura Dedicada EURO — SAS França',
    subtitle: 'Estrutura empresarial francesa com banking e adquirência sujeitos a aprovação.', jurisdiction: 'França', flag: '🇫🇷', currency: 'EUR',
    prices: { EUR: 850, BRL: 5100, USDT: 850 }, managementFeePercent: 20,
    leadTime: 'Sob validação documental e KYC/KYB', availability: 'Disponíveis: 3 de 3',
    highlights: ['SAS dedicada', 'Apoio a conta bancária empresarial', 'Cartão empresarial quando aprovado', 'Gestão bancária direta pelo Merchant quando aplicável', 'Domínio, email, website e VPS', 'Preparação de Store XPAYMENTS']
  },
  {
    slug: 'us-llc-usd', code: 'US-LLC-USD', name: 'Estrutura Dedicada USD — LLC EUA',
    subtitle: 'Estrutura empresarial orientada a operações em USD e infraestrutura dedicada.', jurisdiction: 'Estados Unidos', flag: '🇺🇸', currency: 'USD',
    prices: { EUR: 1200, BRL: 7200, USDT: 1200 }, managementFeePercent: 20,
    leadTime: 'Entrega prevista em até 5 dias após validação documental e KYC/KYB', availability: 'Disponíveis: 8 de 8',
    highlights: ['LLC dedicada', 'Apoio a banking/payout', 'Domínio próprio', 'Email empresarial', 'VPS/API exclusiva', 'Preparação de Store USD XPAYMENTS']
  },
  {
    slug: 'pt-premium-d01', code: 'PT-PREMIUM-D01', name: 'Premium Portugal — Estrutura Empresarial Real Ativa',
    subtitle: 'Oferta premium para atividades legítimas de baixa contestação e perfil compatível com banking/adquirência.', jurisdiction: 'Portugal', flag: '🇵🇹', currency: 'EUR',
    prices: { EUR: 5000, BRL: 30000, USDT: 5000 }, managementFeePercent: 20,
    leadTime: 'Previsão até 3 dias após KYC/KYB e validação documental', availability: 'Disponíveis: 5 de 5', premium: true,
    settlementLabel: 'Liquidação D0–1',
    highlights: ['Estrutura empresarial real ativa', 'Processo documental acompanhado', 'Apoio a banking e adquirência', 'Domínio, email, número e website', 'VPS/API dedicada', 'Preparação e entrega da Store XPAYMENTS']
  }
];

export function getService(slug: string) { return services.find((service) => service.slug === slug); }
