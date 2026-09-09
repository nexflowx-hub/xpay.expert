import Link from 'next/link';
import { getCatalog } from '@/lib/catalog';
import { WorldFlowMap } from '@/components/world-flow-map';

const euro = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const wa = (text: string) => `https://wa.me/351925386409?text=${encodeURIComponent(text)}`;

export default async function Home() {
  const catalog = await getCatalog();

  return <main>
    <section className="hero"><div className="shell hero-layout">
      <div className="hero-copy">
        <span className="eyebrow">XPayments · Expert Operations</span>
        <h1>Estruturas internacionais prontas para operar.</h1>
        <p>Empresa, banking, acquiring, domínio, email, número, website, VPS/API e integração XPAYMENTS organizados num único projeto, com acompanhamento do pedido à entrega.</p>
        <div className="actions">
          <Link className="btn primary" href="#services">Ver estruturas disponíveis</Link>
          <Link className="btn" href="/register">Criar conta Merchant</Link>
          <a className="btn" href={wa('Olá, preciso de uma estrutura ou projeto personalizado e gostaria de falar com um especialista XPay.')}>Falar com especialista</a>
          <Link className="btn ghost" href="/portal">Já tenho conta</Link>
        </div>
      </div>
      <WorldFlowMap />
      <div className="stats">
        <div className="stat"><strong>UK · FR · USA · PT</strong><span>Jurisdições em catálogo</span></div>
        <div className="stat"><strong>EUR · BRL · USDT</strong><span>Fluxos de contratação</span></div>
        <div className="stat"><strong>14 etapas</strong><span>Tracking operacional completo</span></div>
        <div className="stat"><strong>XPAY-ready</strong><span>Infraestrutura preparada para integração</span></div>
      </div>
    </div></section>

    <section id="services" className="section"><div className="shell">
      <div className="sectionhead"><div><span className="eyebrow">Catálogo</span><h2>Estruturas dedicadas</h2></div><p className="muted">Escolha a estrutura, a moeda de contratação e acompanhe todo o processo num único portal. Gestão operacional de 20% da faturação processada.</p></div>
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
        <div className="actions">
          <Link className="btn primary" href={`/portal?service=${service.slug}`}>Contratar</Link>
          <Link className="btn" href={`/register?service=${service.slug}`}>Criar conta e contratar</Link>
          <Link className="btn ghost" href={`/services/${service.slug}`}>Detalhes</Link>
        </div>
      </article>)}</div>
    </div></section>

    <section className="section crypto-section"><div className="shell">
      <div className="sectionhead"><div><span className="eyebrow">Digital Assets</span><h2>P2P Crypto & Liquidity Desk</h2></div><p className="muted">Canal dedicado para projetos relacionados com ativos digitais, liquidez e operações manuais sob consulta.</p></div>
      <div className="crypto-card">
        <div className="crypto-orbit" aria-hidden="true"><span>₿</span><span>₮</span><span>Ξ</span><span>€</span><span>R$</span></div>
        <div className="crypto-copy">
          <div className="badges"><span className="badge availability-badge">AtlasWallet · próximo lançamento</span><span className="badge">P2P / OTC manual</span></div>
          <h3>USDT · BTC · EUR · BRL</h3>
          <p className="muted">Precisa de uma operação direta, estrutura P2P, integração de wallets ou desenho de um fluxo de ativos digitais? A equipa XPay pode analisar o pedido e preparar uma operação ou projeto personalizado.</p>
          <div className="token-row"><span className="token-chip btc">₿ Bitcoin</span><span className="token-chip usdt">₮ USDT</span><span className="token-chip eth">Ξ Ethereum</span><span className="token-chip eur">€ EUR</span><span className="token-chip brl">R$ BRL</span></div>
          <div className="actions"><a className="btn primary" href={wa('Olá, preciso de apoio num projeto P2P/Crypto ou numa operação manual envolvendo USDT, BTC, EUR ou BRL. Gostaria de falar com a equipa XPay.')}>Falar com Crypto Desk</a><a className="btn" href={wa('Olá, gostaria de receber informações sobre o próximo lançamento do AtlasWallet.')}>AtlasWallet · Em breve</a></div>
        </div>
      </div>
    </div></section>

    <section id="custom" className="section custom-section"><div className="shell custom-cta">
      <div><span className="eyebrow">Projetos personalizados</span><h2>Precisa de algo fora do catálogo?</h2><p className="muted">Licenças Gaming, jurisdições específicas, estruturas multiempresa, projetos de acquiring, banking, wallets, infraestrutura dedicada ou necessidades especiais.</p></div>
      <div className="custom-actions"><a className="btn primary" href={wa('Olá, preciso de um projeto personalizado / pedido de cotação. O meu projeto envolve: ')}>Pedir cotação no WhatsApp</a><span>Resposta direta da equipa XPay</span></div>
    </div></section>

    <section id="process" className="section process-section"><div className="shell">
      <div className="sectionhead"><div><span className="eyebrow">Workflow</span><h2>Do pedido à operação</h2></div></div>
      <div className="timeline">
        <div className="step"><b>01 · Contratação</b><span className="muted">Service Order, pagamento e abertura do projeto.</span></div>
        <div className="step"><b>02 · Informações</b><span className="muted">Recolha dos dados e documentos necessários à execução.</span></div>
        <div className="step"><b>03 · Execução</b><span className="muted">Empresa, banking, acquiring e infraestrutura.</span></div>
        <div className="step"><b>04 · Entrega</b><span className="muted">Store, domínio, VPS, acessos e ativos do projeto.</span></div>
      </div>
    </div></section>

    <section className="section"><div className="shell conversion-strip"><div><strong>Tem um projeto em mente?</strong><span>Descreva o objetivo e receba uma orientação direta da equipa.</span></div><a className="btn primary" href={wa('Olá, estou no XPay.Expert e quero avançar com um projeto. Posso enviar os detalhes?')}>Iniciar conversa</a></div></section>
  </main>;
}
