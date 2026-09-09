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
    subtitle: 'Entidade dedicada com infraestrutura própria para operação internacional e integração ao ecossistema XPAYMENTS.', jurisdiction: 'Reino Unido', flag: '🇬🇧', currency: 'EUR',
    prices: { EUR: 500, BRL: 3000, USDT: 500 }, managementFeePercent: 20,
    leadTime: 'Entrega prevista entre 3 e 5 dias', availability: 'Disponíveis: 11 de 12',
    highlights: ['UK LTD dedicada', 'Estrutura bancária e payout', 'Domínio próprio', 'VPS dedicada para API', 'Número de celular UK', 'Preparação de Store XPAYMENTS']
  },
  {
    slug: 'fr-sas-eur', code: 'FR-SAS-EUR', name: 'Estrutura Dedicada EURO — SAS França',
    subtitle: 'Estrutura empresarial francesa com banking, adquirência e infraestrutura digital integrada.', jurisdiction: 'França', flag: '🇫🇷', currency: 'EUR',
    prices: { EUR: 850, BRL: 5100, USDT: 850 }, managementFeePercent: 20,
    leadTime: 'Prazo definido após abertura do projeto', availability: 'Disponíveis: 2 de 3',
    highlights: ['SAS dedicada', 'Estrutura bancária empresarial', 'Cartão empresarial quando disponível', 'Gestão bancária direta pelo Merchant', 'Domínio, email, website e VPS', 'Preparação de Store XPAYMENTS']
  },
  {
    slug: 'us-llc-usd', code: 'US-LLC-USD', name: 'Estrutura Dedicada USD — LLC EUA',
    subtitle: 'Estrutura empresarial orientada a operações em USD, banking e infraestrutura dedicada.', jurisdiction: 'Estados Unidos', flag: '🇺🇸', currency: 'USD',
    prices: { EUR: 1200, BRL: 7200, USDT: 1200 }, managementFeePercent: 20,
    leadTime: 'Entrega prevista em até 5 dias', availability: 'Disponíveis: 7 de 8',
    highlights: ['LLC dedicada', 'Banking e payout', 'Domínio próprio', 'Email empresarial', 'VPS/API exclusiva', 'Preparação de Store USD XPAYMENTS']
  },
  {
    slug: 'pt-premium-d01', code: 'PT-PREMIUM-D01', name: 'Premium Portugal — Estrutura Empresarial Real Ativa',
    subtitle: 'Estrutura premium pronta para integração operacional, banking, adquirência e infraestrutura digital.', jurisdiction: 'Portugal', flag: '🇵🇹', currency: 'EUR',
    prices: { EUR: 5000, BRL: 30000, USDT: 5000 }, managementFeePercent: 20,
    leadTime: 'Previsão de entrega até 3 dias', availability: 'Disponíveis: 4 de 5', premium: true,
    settlementLabel: 'Liquidação D0–1',
    highlights: ['Estrutura empresarial real ativa', 'Processo documental acompanhado', 'Banking e adquirência', 'Domínio, email, número e website', 'VPS/API dedicada', 'Preparação e entrega da Store XPAYMENTS']
  }
];

export function getService(slug: string) { return services.find((service) => service.slug === slug); }
