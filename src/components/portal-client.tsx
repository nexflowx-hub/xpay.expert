'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { services } from '@/lib/services';

type Currency = 'EUR' | 'BRL' | 'USDT';
type Order = {
  id:string;
  orderCode?:string;
  status?:string;
  progress?:number;
  paymentStatus?:string;
  paymentCurrency?:string;
  paymentAmount?:number;
  offering?:{name?:string;code?:string};
  serviceName?:string;
  createdAt?:string;
};

type SepaAccount = {
  label:string;
  beneficiary:string;
  iban:string;
  bic:string;
  bank:string;
  bankAddress?:string;
  bankCountry?:string;
};

type PixKey = { label:string; keyType:string; key:string };
type CryptoWallet = { network:string; standard:string; address:string; explorer?:string };

type PaymentInstructions = {
  order?: { orderCode?:string; amount?:number; currency?:string; paymentStatus?:string };
  payment?: {
    reference?:string;
    confirmationMode?:string;
    proofRequired?:boolean;
    instructions?: {
      method?:string;
      accounts?:SepaAccount[];
      keys?:PixKey[];
      wallets?:CryptoWallet[];
      preferredNetwork?:string;
      asset?:string;
      qrCode?:{available?:boolean;reason?:string};
    };
  };
};

const WA = '351925386409';

export default function PortalClient({ initialService }: { initialService?: string }) {
  const [authenticated,setAuthenticated]=useState(false);
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [orders,setOrders]=useState<Order[]>([]);
  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState('');
  const [currency,setCurrency]=useState<Currency>('EUR');
  const [paymentByOrder,setPaymentByOrder]=useState<Record<string,PaymentInstructions>>({});
  const [paymentLoading,setPaymentLoading]=useState<string>('');
  const selected=useMemo(()=>services.find(s=>s.slug===initialService),[initialService]);

  async function loadOrders(){
    setLoading(true); setError('');
    try{
      const r=await fetch('/api/orders',{cache:'no-store'});
      if(r.status===401){setAuthenticated(false);return;}
      const j=await r.json();
      if(!r.ok) throw new Error(j?.error?.message||'Não foi possível carregar as contratações.');
      setAuthenticated(true); setOrders(j?.data?.orders||j?.data||[]);
    }catch(e:any){setError(e.message||'Erro ao carregar.');}finally{setLoading(false);}
  }

  useEffect(()=>{loadOrders();},[]);

  async function login(e:FormEvent){
    e.preventDefault();setLoading(true);setError('');
    try{
      const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
      const j=await r.json();
      if(!r.ok)throw new Error(j?.error?.message||'Credenciais inválidas.');
      setAuthenticated(true);await loadOrders();
    }catch(e:any){setError(e.message||'Falha no login.');}finally{setLoading(false);}
  }

  async function loadPayment(orderId:string){
    setPaymentLoading(orderId);setError('');
    try{
      const r=await fetch(`/api/orders/${encodeURIComponent(orderId)}/payment-instructions`,{cache:'no-store'});
      const j=await r.json();
      if(!r.ok)throw new Error(j?.error?.message||'Não foi possível carregar as instruções de pagamento.');
      setPaymentByOrder(current=>({...current,[orderId]:j?.data||{}}));
    }catch(e:any){setError(e.message||'Falha ao carregar instruções.');}finally{setPaymentLoading('');}
  }

  async function createOrder(slug:string){
    setLoading(true);setError('');setMessage('');
    try{
      const service=services.find(s=>s.slug===slug);
      if(!service)throw new Error('Serviço inválido.');
      const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({offeringCode:service.code,currency})});
      const j=await r.json();
      if(!r.ok)throw new Error(j?.error?.message||'Não foi possível iniciar a contratação.');
      const orderCode=j?.data?.order?.orderCode||'nova contratação';
      const orderId=j?.data?.order?.id;
      setMessage(`Contratação ${orderCode} criada. O pagamento fica pendente até reconciliação/confirmação.`);
      await loadOrders();
      if(orderId) await loadPayment(orderId);
    }catch(e:any){setError(e.message||'Falha ao contratar.');}finally{setLoading(false);}
  }

  async function copyValue(value:string){
    try{
      await navigator.clipboard.writeText(value);
      setMessage('Copiado para a área de transferência.');
    }catch{
      setError('Não foi possível copiar automaticamente.');
    }
  }

  function proofUrl(order:Order){
    const text=[
      'Olá, XPay Expert.',
      `Pretendo enviar o comprovativo da encomenda ${order.orderCode||order.id}.`,
      `Serviço: ${order.offering?.name||order.serviceName||'XPay Expert'}.`,
      `Pagamento: ${order.paymentAmount??''} ${order.paymentCurrency||''}.`,
      'Vou anexar o comprovativo nesta conversa.'
    ].join('\n');
    return `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  }

  function paymentPanel(order:Order){
    const data=paymentByOrder[order.id];
    if(!data?.payment) return null;
    const instructions=data.payment.instructions||{};
    const reference=data.payment.reference||order.orderCode||order.id;

    return <div className="notice" style={{marginTop:16}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap',alignItems:'center'}}>
        <div><strong>Instruções de pagamento · {instructions.method||order.paymentCurrency}</strong><div className="muted" style={{fontSize:13}}>Referência obrigatória: {reference}</div></div>
        <button className="btn" type="button" onClick={()=>copyValue(reference)}>Copiar referência</button>
      </div>

      {instructions.accounts?.map((account,index)=><div key={`${account.iban}-${index}`} className="order" style={{marginTop:12,marginBottom:0}}>
        <strong>{account.label||`Conta SEPA ${index+1}`}</strong>
        <p className="muted" style={{marginBottom:7}}>Beneficiário: {account.beneficiary}</p>
        <p style={{wordBreak:'break-all',margin:'7px 0'}}><b>IBAN:</b> {account.iban}</p>
        <p style={{margin:'7px 0'}}><b>BIC/SWIFT:</b> {account.bic}</p>
        <p className="muted" style={{margin:'7px 0'}}>{account.bank}{account.bankCountry?` · ${account.bankCountry}`:''}</p>
        <div className="actions"><button className="btn" type="button" onClick={()=>copyValue(account.iban)}>Copiar IBAN</button></div>
      </div>)}

      {instructions.keys?.map((pix,index)=><div key={`${pix.key}-${index}`} className="order" style={{marginTop:12,marginBottom:0}}>
        <strong>{pix.label||`Chave PIX ${index+1}`}</strong>
        <p className="muted">Tipo: {pix.keyType}</p>
        <p style={{wordBreak:'break-all'}}>{pix.key}</p>
        <div className="actions"><button className="btn" type="button" onClick={()=>copyValue(pix.key)}>Copiar chave PIX</button></div>
      </div>)}

      {instructions.wallets?.map((wallet,index)=><div key={`${wallet.standard}-${index}`} className="order" style={{marginTop:12,marginBottom:0}}>
        <strong>{wallet.network} · {wallet.standard}</strong>
        {index===0&&instructions.preferredNetwork&&<span className="badge" style={{marginLeft:8}}>Preferencial</span>}
        <p style={{wordBreak:'break-all'}}>{wallet.address}</p>
        <div className="actions"><button className="btn" type="button" onClick={()=>copyValue(wallet.address)}>Copiar endereço</button>{wallet.explorer&&<a className="btn" target="_blank" rel="noreferrer" href={wallet.explorer}>Ver explorer</a>}</div>
      </div>)}

      {instructions.qrCode?.available===false&&<p className="muted" style={{fontSize:12,marginTop:12}}>{instructions.qrCode.reason}</p>}
      <p className="muted" style={{fontSize:12,marginBottom:0}}>O pagamento permanece PENDING até conferência do comprovativo/reconciliação. Estas instruções não geram crédito automático na Wallet.</p>
    </div>;
  }

  if(!authenticated) return <div className="login panel">
    <span className="eyebrow">Área Merchant</span><h1>Entrar com a sua conta XPAYMENTS</h1>
    <p className="muted">Use as mesmas credenciais do dashboard XPAYMENTS. A autenticação é processada pela API XPAYMENTS.</p>
    {selected&&<div className="notice">Serviço selecionado: <strong>{selected.flag} {selected.name}</strong></div>}
    <form onSubmit={login}>
      <div className="field"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
      <div className="field"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
      {error&&<p className="error">{error}</p>}<button className="btn primary" disabled={loading}>{loading?'A validar…':'Entrar'}</button>
    </form>
  </div>;

  const selectedAmount=selected?.prices[currency]||0;

  return <div className="shell portalgrid">
    <aside className="panel sidebar"><div className="brand">XPAY<span>.EXPERT</span></div><div className="divider"/><a className="active" href="#orders">Minhas Contratações</a><a href="/#services">Catálogo de Serviços</a><a href="https://www.xpayments.digital">Dashboard XPAYMENTS</a><a href="https://www.xpayments.digital/doc">Documentação</a></aside>
    <section>
      <div className="sectionhead"><div><span className="eyebrow">Merchant Portal</span><h2>Serviços & processos</h2></div><p className="muted">Acompanhe cada etapa até à entrega da nova estrutura e Store.</p></div>
      {selected&&<div className={`panel ${selected.premium?'premium':''}`} style={{marginBottom:18}}>
        <div className="country-head"><div className="flag">{selected.flag}</div><div><div className="tag">Novo pedido</div><h3 style={{margin:'5px 0'}}>{selected.name}</h3></div></div>
        {selected.premium&&<div className="premium-glow">{selected.settlementLabel||'Liquidação D0–1'}</div>}
        <p className="muted">Escolha a moeda de pagamento. A contratação permanece pendente até confirmação/reconciliação do recebimento.</p>
        <div className="field" style={{maxWidth:280}}><label>Moeda</label><select value={currency} onChange={e=>setCurrency(e.target.value as Currency)}><option value="EUR">EUR — Transferência SEPA</option><option value="BRL">BRL — PIX</option><option value="USDT">USDT — Crypto</option></select></div>
        <p><strong>Valor:</strong> {selectedAmount.toLocaleString(currency==='BRL'?'pt-BR':'pt-PT')} {currency}</p>
        <button className="btn primary" onClick={()=>createOrder(selected.slug)} disabled={loading}>{loading?'A criar…':'Iniciar contratação'}</button>
      </div>}
      {message&&<p className="success">{message}</p>}{error&&<p className="error">{error}</p>}
      <div id="orders" className="panel"><h3>Minhas Contratações</h3>
        {loading&&<p className="muted">A carregar…</p>}
        {!loading&&orders.length===0&&<p className="muted">Ainda não existem contratações nesta conta.</p>}
        {orders.map((o)=><article className="order" key={o.id}>
          <div style={{display:'flex',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}><strong>{o.offering?.name||o.serviceName||'Serviço XPay Expert'}</strong><span className="badge">{o.status||'ORDER_CREATED'}</span></div>
          <p className="muted">{o.orderCode||o.id}</p>
          <div className="badges"><span className="badge">Pagamento: {o.paymentStatus||'PENDING'}</span>{o.paymentCurrency&&<span className="badge">{o.paymentAmount?.toLocaleString()} {o.paymentCurrency}</span>}</div>
          <div className="progress" style={{marginTop:14}}><span style={{width:`${Math.max(5,Math.min(100,o.progress||10))}%`}}/></div>
          {(o.paymentStatus||'PENDING')!=='PAID'&&<div className="actions"><button className="btn primary" type="button" onClick={()=>loadPayment(o.id)} disabled={paymentLoading===o.id}>{paymentLoading===o.id?'A carregar…':paymentByOrder[o.id]?'Atualizar instruções':'Ver instruções de pagamento'}</button><a className="btn" target="_blank" rel="noreferrer" href={proofUrl(o)}>Enviar comprovativo no WhatsApp</a></div>}
          {paymentPanel(o)}
        </article>)}
      </div>
    </section>
  </div>;
}
