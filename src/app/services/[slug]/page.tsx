import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getService, services } from '@/lib/services';

export function generateStaticParams() { return services.map(({ slug }) => ({ slug })); }

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  return <main className="detail"><div className="shell">
    <div className="detailgrid">
      <section className="panel">
        <span className="eyebrow">{service.jurisdiction}{service.premium ? ' · Premium' : ''}</span>
        <h1 style={{fontSize:'clamp(36px,5vw,62px)',letterSpacing:'-.05em',lineHeight:1.02}}>{service.name}</h1>
        <p className="muted" style={{fontSize:18}}>{service.subtitle}</p>
        <div className="divider" />
        <h3>Incluído na estrutura</h3>
        <ul className="list">{service.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
        <h3>Fluxo de entrega</h3>
        <p className="muted">Contratação e pagamento → recolha de informações → constituição da estrutura → onboarding de banking/adquirentes → infraestrutura digital → configuração XPAYMENTS → quality check → entrega.</p>
        <div className="notice"><strong>Condições.</strong> KYC/KYB e aprovação por bancos, adquirentes, telecoms ou outros terceiros são independentes e não são garantidos. O prazo começa após receção e validação da documentação necessária.</div>
      </section>
      <aside className="panel">
        <div className="kicker">Setup da estrutura</div>
        <div className="price">€ {service.prices.EUR.toLocaleString('pt-PT')}</div>
        <p className="pricealt">R$ {service.prices.BRL.toLocaleString('pt-BR')} · {service.prices.USDT.toLocaleString('pt-PT')} USDT</p>
        <div className="divider" />
        <p><strong>Gestão operacional</strong><br/><span className="muted">{service.managementFeePercent}% da faturação processada, incluindo acompanhamento até BRL ou USDT quando aplicável.</span></p>
        <p><strong>Prazo</strong><br/><span className="muted">{service.leadTime}</span></p>
        {service.availability && <p><strong>Disponibilidade</strong><br/><span className="muted">{service.availability}</span></p>}
        <div className="actions"><Link className="btn primary" href={`/portal?service=${service.slug}`}>Contratar agora</Link><a className="btn" href={`https://wa.me/351925386409?text=${encodeURIComponent(`Olá, pretendo informações sobre ${service.name}`)}`}>WhatsApp</a></div>
      </aside>
    </div>
  </div></main>;
}
