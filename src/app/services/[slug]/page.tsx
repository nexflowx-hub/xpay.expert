import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCatalog } from '@/lib/catalog';
import { services } from '@/lib/services';

export function generateStaticParams() { return services.map(({ slug }) => ({ slug })); }

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const service = catalog.find((item) => item.slug === slug);
  if (!service) notFound();

  const wa = `https://wa.me/351925386409?text=${encodeURIComponent(`Olá, pretendo avançar com ${service.name}. Gostaria de falar com um especialista XPay.`)}`;

  return <main className="detail"><div className="shell">
    <div className="detailgrid">
      <section className="panel">
        <div className="flag" aria-hidden="true">{service.flag}</div>
        <span className="eyebrow">{service.jurisdiction}{service.premium ? ' · Premium' : ''}</span>
        {service.premium && <div className="premium-glow">{service.settlementLabel || 'Liquidação D0–1'}</div>}
        <h1 style={{fontSize:'clamp(36px,5vw,62px)',letterSpacing:'-.05em',lineHeight:1.02}}>{service.name}</h1>
        <p className="muted" style={{fontSize:18}}>{service.subtitle}</p>
        <div className="divider" />
        <h3>Incluído na estrutura</h3>
        <ul className="list">{service.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
        <h3>Fluxo de entrega</h3>
        <p className="muted">Contratação e pagamento → recolha de informações → constituição da estrutura → banking/adquirência → infraestrutura digital → configuração XPAYMENTS → quality check → entrega.</p>
        <div className="notice"><strong>Projeto acompanhado.</strong> A equipa XPay centraliza a execução, o tracking e a entrega dos ativos do projeto num único fluxo operacional.</div>
      </section>
      <aside className={`panel ${service.premium ? 'premium' : ''}`}>
        <div className="kicker">Setup da estrutura</div>
        <div className="price">€ {service.prices.EUR.toLocaleString('pt-PT')}</div>
        <p className="pricealt">R$ {service.prices.BRL.toLocaleString('pt-BR')} · {service.prices.USDT.toLocaleString('pt-PT')} USDT</p>
        <div className="divider" />
        <p><strong>Gestão operacional</strong><br/><span className="muted">{service.managementFeePercent}% da faturação processada, incluindo acompanhamento até BRL ou USDT quando aplicável.</span></p>
        <p><strong>Prazo</strong><br/><span className="muted">{service.leadTime}</span></p>
        {service.availability && <p><strong>Disponibilidade</strong><br/><span className="muted">{service.availability}</span></p>}

        <div className="notice" style={{marginTop:16}}>
          <strong>Ainda não tem conta Merchant?</strong>
          <p className="muted" style={{marginBottom:0}}>Crie a conta agora e avance diretamente para a contratação desta estrutura.</p>
        </div>

        <div className="actions">
          <Link className="btn primary" href={`/register?service=${service.slug}`}>Criar conta e contratar</Link>
          <Link className="btn" href={`/portal?service=${service.slug}`}>Já tenho conta</Link>
          <a className="btn ghost" href={wa}>WhatsApp</a>
        </div>
        <div className="divider" />
        <p className="muted" style={{fontSize:13}}>Precisa de outra jurisdição, licença Gaming, estrutura multiempresa ou projeto específico?</p>
        <a className="wa" href={`https://wa.me/351925386409?text=${encodeURIComponent('Olá, preciso de um projeto personalizado / cotação fora do catálogo XPay.Expert.')}`}>Pedir projeto personalizado →</a>
      </aside>
    </div>
  </div></main>;
}
