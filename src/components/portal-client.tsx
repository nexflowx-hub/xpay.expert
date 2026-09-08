'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { services } from '@/lib/services';

type Order = { id:string; orderCode?:string; status?:string; progress?:number; offering?:{name?:string}; serviceName?:string; createdAt?:string };

export default function PortalClient({ initialService }: { initialService?: string }) {
  const [authenticated,setAuthenticated]=useState(false);
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState('');
  const [orders,setOrders]=useState<Order[]>([]); const [loading,setLoading]=useState(false); const [message,setMessage]=useState('');
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

  async function login(e:FormEvent){e.preventDefault();setLoading(true);setError('');
    try{const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const j=await r.json();if(!r.ok)throw new Error(j?.error?.message||'Credenciais inválidas.');setAuthenticated(true);await loadOrders();}catch(e:any){setError(e.message||'Falha no login.');}finally{setLoading(false);}}

  async function createOrder(slug:string){setLoading(true);setError('');setMessage('');
    try{const service=services.find(s=>s.slug===slug);if(!service)throw new Error('Serviço inválido.');const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({offeringCode:service.code,currency:'EUR'})});const j=await r.json();if(!r.ok)throw new Error(j?.error?.message||'Não foi possível iniciar a contratação.');setMessage('Contratação criada. A equipa XPay Expert dará continuidade ao processo.');await loadOrders();}catch(e:any){setError(e.message||'Falha ao contratar.');}finally{setLoading(false);}}

  if(!authenticated) return <div className="login panel"><span className="eyebrow">Área Merchant</span><h1>Entrar com a sua conta XPAYMENTS</h1><p className="muted">Use as mesmas credenciais do dashboard XPAYMENTS. A autenticação é processada pela API XPAYMENTS.</p>{selected&&<div className="notice">Serviço selecionado: <strong>{selected.name}</strong></div>}<form onSubmit={login}><div className="field"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div><div className="field"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></div>{error&&<p className="error">{error}</p>}<button className="btn primary" disabled={loading}>{loading?'A validar…':'Entrar'}</button></form></div>;

  return <div className="shell portalgrid"><aside className="panel sidebar"><div className="brand">XPAY<span>.EXPERT</span></div><div className="divider"/><a className="active" href="#orders">Minhas Contratações</a><a href="/#services">Catálogo de Serviços</a><a href="https://www.xpayments.digital">Dashboard XPAYMENTS</a><a href="https://www.xpayments.digital/doc">Documentação</a></aside><section>
    <div className="sectionhead"><div><span className="eyebrow">Merchant Portal</span><h2>Serviços & processos</h2></div><p className="muted">Acompanhe cada etapa até à entrega da nova estrutura e Store.</p></div>
    {selected&&<div className="panel" style={{marginBottom:18}}><div className="tag">Novo pedido</div><h3>{selected.name}</h3><p className="muted">Setup: € {selected.prices.EUR.toLocaleString('pt-PT')} · Gestão operacional: {selected.managementFeePercent}%.</p><button className="btn primary" onClick={()=>createOrder(selected.slug)} disabled={loading}>{loading?'A criar…':'Iniciar contratação'}</button></div>}
    {message&&<p className="success">{message}</p>}{error&&<p className="error">{error}</p>}
    <div id="orders" className="panel"><h3>Minhas Contratações</h3>{loading&&<p className="muted">A carregar…</p>}{!loading&&orders.length===0&&<p className="muted">Ainda não existem contratações nesta conta.</p>}{orders.map((o)=><article className="order" key={o.id}><div style={{display:'flex',justifyContent:'space-between',gap:10}}><strong>{o.offering?.name||o.serviceName||'Serviço XPay Expert'}</strong><span className="badge">{o.status||'ORDER_CREATED'}</span></div><p className="muted">{o.orderCode||o.id}</p><div className="progress"><span style={{width:`${Math.max(5,Math.min(100,o.progress||10))}%`}}/></div></article>)}</div>
  </section></div>;
}
