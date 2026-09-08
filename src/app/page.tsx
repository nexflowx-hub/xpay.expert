import Link from 'next/link';
import { getCatalog } from '@/lib/catalog';
import { WorldFlowMap } from '@/components/world-flow-map';

const euro = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export default async function Home() {
  const catalog = await getCatalog();

  return <main>
    <section className="hero"><div className="shell hero-layout">
      <div className="hero-copy">
        <span className="eyebrow">XPayments · Expert Operations</span>
        <h1>Estrutura empresarial, banking, acquiring e infraestrutura. Num único fluxo operacional.</h1>
        <p>O XPay Expert transforma a contratação de uma estrutura dedicada num processo rastreável: pagamento, recolha documental, constituição, banking, adquirência, domínio, email, número, website, VPS e ativação da nova Store no XPAYMENTS.</p>
        <div className="actions"><Link className="btn primary" href="#services">Explorar serviços</Link><Link className="btn" href="/portal">Acompanhar contratação</Link></div>
      </div>
      <WorldFlowMap />
      <div className="stats">
        <div className="stat"><strong>1 conta</strong><span>Mesmo Merchant XPAYMENTS</span></div>
        <div className="stat"><strong>1 tracking</strong><span>Da contratação à entrega</span></div>
        <div className="stat"><strong>Multi-provider</strong><span>Banking e acquiring</span></div>
        <div className="stat"><strong>Store-ready</strong><span>Entrega integrada ao XPAYMENTS</span></div>
      </div>
    </div></section>

    <section id="services" className="section"><div className="shell">
      <div className="sectionhead"><div><span className="eyebrow">Catálogo</span><h2>Estruturas dedicadas</h2></div><p className="muted">Setup inicial + gestão operacional de 20% da faturação processada, incluindo acompanhamento do fluxo até BRL ou USDT quando aplicável.</p></div>
      <div className="grid">{catalog.map((service) => <article key={service.code} className={`card service-card ${service.premium ? 'premium' : ''}`}>
        <div className="country-head">
          <div className="flag" aria-hidden="true">{service.flag}</div>
          <div>
            <div className="tag">{service.jurisdiction}{service.premium ? ' · Premium' : ''}</div>
            <div className="service-code">{service.code}</div>
          </div>
        </div>
        {service.premium && <div className="premium-glow">{service.settlementLabel || 'Liquidação D0–1'}</div>}
        <h3>{service.name}</h3><p className="muted">{service.subtitle}</p>
        <div className="price">{euro.format(service.prices.EUR)}</div><div className="pricealt">{brl.format(service.prices.BRL)} · {service.prices.USDT} USDT</div>
        {(service.availability || service.leadTime) && <div className="badges">{service.availability && <span className="badge availability-badge">{service.availability}</span>}<span className="badge">{service.leadTime}</span></div>}
        <ul className="list">{service.highlights.slice(0,4).map((item) => <li key={item}>{item}</li>)}</ul>
        <div className="actions"><Link className="btn primary" href={`/services/${service.slug}`}>Ver serviço</Link><Link className="btn" href={`/portal?service=${service.slug}`}>Contratar</Link></div>
      </article>)}</div>
    </div></section>

    <section id="process" className="section process-section"><div className="shell">
      <div className="sectionhead"><div><span className="eyebrow">Workflow</span><h2>Do pedido à Store ativa</h2></div></div>
      <div className="timeline">
        <div className="step"><b>01 · Contratação</b><span className="muted">Service Order, pagamento e confirmação.</span></div>
        <div className="step"><b>02 · KYC/KYB</b><span className="muted">Recolha de dados e documentação necessária.</span></div>
        <div className="step"><b>03 · Execução</b><span className="muted">Empresa, banking, acquiring e infraestrutura.</span></div>
        <div className="step"><b>04 · Entrega</b><span className="muted">Store, GatewayVault, domínio, VPS e acessos.</span></div>
      </div>
    </div></section>

    <section className="section"><div className="shell notice"><strong>Importante.</strong> A constituição e os serviços de infraestrutura são prestados mediante documentação válida. Contas bancárias, cartões, adquirência e outros serviços de terceiros dependem de KYC/KYB, elegibilidade e aprovação independente da respetiva instituição. Não existe garantia de aprovação.</div></section>
  </main>;
}
