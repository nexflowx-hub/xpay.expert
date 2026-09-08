'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type OpsOrder = {
  id:string; orderCode:string; status:string; progress:number; paymentStatus:string;
  paymentCurrency?:string; paymentAmount?:number; assignedTo?:string|null; currentStep?:string|null;
  merchant?:{id:string;name:string;email:string};
  offering?:{code:string;name:string;jurisdiction?:string};
  createdAt?:string; updatedAt?:string;
};

type Step = { id:string; code:string; label:string; status:string; position:number; notes?:string|null };
type Asset = { id:string; kind:string; label?:string|null; valueText?:string|null; url?:string|null; sensitive?:boolean };
type Detail = { order:OpsOrder & { internalNotes?:string|null; customerNotes?:string|null }; steps:Step[]; assets:Asset[]; audit:any[] };

const COLUMNS = [
  { key:'NEW', label:'Novos / Pagamento', steps:['CONTRACT_PAYMENT'] },
  { key:'INFO', label:'Informações / KYC', steps:['INFORMATION_COLLECTION','KYC_KYB'] },
  { key:'ENTITY', label:'Estrutura Empresarial', steps:['ENTITY_FORMATION'] },
  { key:'BANKING', label:'Banking', steps:['BANKING_ONBOARDING'] },
  { key:'ACQUIRER', label:'Adquirência', steps:['ACQUIRER_ONBOARDING'] },
  { key:'INFRA', label:'Infraestrutura', steps:['DOMAIN_SETUP','EMAIL_SETUP','PHONE_SETUP','WEBSITE_SETUP','VPS_API_SETUP','XPAYMENTS_STORE_SETUP'] },
  { key:'QA', label:'Quality Check', steps:['QUALITY_CHECK'] },
  { key:'DONE', label:'Entregues', steps:['DELIVERY'] }
];

const STEP_STATES = ['PENDING','IN_PROGRESS','COMPLETED','BLOCKED','SKIPPED'];
const ASSET_KINDS = ['LEGAL_ENTITY','COMPANY_NUMBER','BANK_ACCOUNT','ACQUIRER','DOMAIN','EMAIL','PHONE','VPS','WEBSITE','XPAYMENTS_STORE','GATEWAY_VAULT','PROVIDER_CONNECTION','DOCUMENT','OTHER'];

function columnFor(order:OpsOrder) {
  if (order.status === 'DELIVERED' || order.progress >= 100) return 'DONE';
  const step = String(order.currentStep || 'CONTRACT_PAYMENT');
  return COLUMNS.find(c => c.steps.includes(step))?.key || 'NEW';
}

async function api(path:string, init?:RequestInit) {
  const response = await fetch(`/api/ops/${path}`, { cache:'no-store', ...init });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(payload?.error?.message || 'Falha na operação.'), { status:response.status });
  return payload;
}

export default function OpsClient() {
  const [mode,setMode]=useState<'loading'|'login'|'forbidden'|'ready'>('loading');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [orders,setOrders]=useState<OpsOrder[]>([]);
  const [selected,setSelected]=useState<string|null>(null);
  const [detail,setDetail]=useState<Detail|null>(null);
  const [search,setSearch]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [proofReference,setProofReference]=useState('');
  const [paymentNote,setPaymentNote]=useState('');
  const [assignedTo,setAssignedTo]=useState('');
  const [internalNotes,setInternalNotes]=useState('');
  const [assetKind,setAssetKind]=useState('LEGAL_ENTITY');
  const [assetLabel,setAssetLabel]=useState('');
  const [assetValue,setAssetValue]=useState('');
  const [assetUrl,setAssetUrl]=useState('');
  const [assetSensitive,setAssetSensitive]=useState(false);

  async function bootstrap() {
    setError('');
    try {
      await api('me');
      setMode('ready');
      await loadOrders();
    } catch (e:any) {
      if (e?.status === 401) setMode('login');
      else if (e?.status === 403) setMode('forbidden');
      else { setMode('login'); setError(e.message || 'Falha ao validar acesso.'); }
    }
  }

  async function loadOrders() {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    const payload = await api(`orders${q}`);
    setOrders(payload?.data?.orders || []);
  }

  async function loadDetail(orderId:string) {
    setSelected(orderId); setBusy(true); setError('');
    try {
      const payload = await api(`orders/${orderId}`);
      const data = payload?.data as Detail;
      setDetail(data);
      setAssignedTo(data?.order?.assignedTo || '');
      setInternalNotes(data?.order?.internalNotes || '');
    } catch(e:any) { setError(e.message || 'Falha ao carregar detalhe.'); }
    finally { setBusy(false); }
  }

  useEffect(() => { bootstrap(); }, []);

  async function login(e:FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const r = await fetch('/api/auth/login',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password}) });
      const j = await r.json();
      if(!r.ok) throw new Error(j?.error?.message || 'Credenciais inválidas.');
      await bootstrap();
    } catch(e:any) { setError(e.message || 'Falha no login.'); }
    finally { setBusy(false); }
  }

  async function confirmPayment() {
    if (!detail) return;
    setBusy(true); setError(''); setMessage('');
    try {
      await api(`orders/${detail.order.id}/confirm-payment`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({proofReference,note:paymentNote})
      });
      setMessage('Pagamento confirmado manualmente. Nenhum movimento financeiro foi criado.');
      await Promise.all([loadOrders(), loadDetail(detail.order.id)]);
    } catch(e:any) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function updateStep(step:Step, status:string) {
    if (!detail) return;
    setBusy(true); setError('');
    try {
      await api(`orders/${detail.order.id}/steps/${step.code}`, {
        method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status,notes:step.notes || null})
      });
      await Promise.all([loadOrders(), loadDetail(detail.order.id)]);
    } catch(e:any) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function saveOrderMeta() {
    if (!detail) return;
    setBusy(true); setError('');
    try {
      await api(`orders/${detail.order.id}`, {
        method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({assignedTo,internalNotes})
      });
      setMessage('Responsável e notas internas atualizados.');
      await Promise.all([loadOrders(), loadDetail(detail.order.id)]);
    } catch(e:any) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function addAsset(e:FormEvent) {
    e.preventDefault(); if (!detail) return;
    setBusy(true); setError('');
    try {
      await api(`orders/${detail.order.id}/assets`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({kind:assetKind,label:assetLabel,valueText:assetValue,url:assetUrl,sensitive:assetSensitive})
      });
      setAssetLabel(''); setAssetValue(''); setAssetUrl(''); setAssetSensitive(false);
      setMessage('Entregável adicionado à operação.');
      await loadDetail(detail.order.id);
    } catch(e:any) { setError(e.message); }
    finally { setBusy(false); }
  }

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return orders;
    return orders.filter(o => [o.orderCode,o.merchant?.name,o.merchant?.email,o.offering?.name].some(v => String(v||'').toLowerCase().includes(needle)));
  },[orders,search]);

  if (mode === 'loading') return <div className="login panel"><p className="muted">A validar acesso Expert Operations…</p></div>;

  if (mode === 'login') return <div className="login panel">
    <span className="eyebrow">Internal Control Plane</span><h1>Expert Operations</h1>
    <p className="muted">Acesso reservado a utilizadores internos autorizados.</p>
    <form onSubmit={login}>
      <div className="field"><label>Email XPAYMENTS</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
      <div className="field"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
      {error&&<p className="error">{error}</p>}<button className="btn primary" disabled={busy}>{busy?'A validar…':'Entrar'}</button>
    </form>
  </div>;

  if (mode === 'forbidden') return <div className="login panel"><span className="eyebrow">403</span><h1>Acesso não autorizado</h1><p className="muted">A conta está autenticada, mas não pertence ao grupo Expert Operations.</p></div>;

  return <div className="ops-shell">
    <header className="ops-topbar">
      <div><div className="brand">XPAY<span>.EXPERT</span></div><div className="kicker">Expert Operations · Control Plane</div></div>
      <div className="ops-search"><input placeholder="Pesquisar order, Merchant ou serviço…" value={search} onChange={e=>setSearch(e.target.value)} /><button className="btn" onClick={()=>loadOrders()}>Atualizar</button></div>
    </header>

    {error&&<div className="ops-alert error">{error}</div>}{message&&<div className="ops-alert success">{message}</div>}

    <section className="ops-metrics">
      <div className="ops-metric"><span>Operações</span><strong>{orders.length}</strong></div>
      <div className="ops-metric"><span>Pagamento pendente</span><strong>{orders.filter(o=>o.paymentStatus!=='PAID').length}</strong></div>
      <div className="ops-metric"><span>Em execução</span><strong>{orders.filter(o=>o.progress>5&&o.progress<100).length}</strong></div>
      <div className="ops-metric"><span>Entregues</span><strong>{orders.filter(o=>o.progress>=100||o.status==='DELIVERED').length}</strong></div>
    </section>

    <section className="ops-board">
      {COLUMNS.map(col => {
        const items = filtered.filter(o=>columnFor(o)===col.key);
        return <div className="ops-column" key={col.key}>
          <div className="ops-column-head"><strong>{col.label}</strong><span>{items.length}</span></div>
          <div className="ops-column-body">{items.map(o => <button key={o.id} className={`ops-card ${selected===o.id?'active':''}`} onClick={()=>loadDetail(o.id)}>
            <div className="ops-card-row"><b>{o.orderCode}</b><span className={`ops-pay ${o.paymentStatus==='PAID'?'paid':'pending'}`}>{o.paymentStatus}</span></div>
            <div className="ops-card-service">{o.offering?.name}</div>
            <div className="ops-card-merchant">{o.merchant?.name || o.merchant?.email}</div>
            <div className="ops-progress"><span style={{width:`${Math.min(100,Math.max(5,o.progress||5))}%`}} /></div>
            <div className="ops-card-foot"><span>{o.progress}%</span><span>{o.assignedTo || 'Sem responsável'}</span></div>
          </button>)}</div>
        </div>;
      })}
    </section>

    {detail&&<section className="ops-detail panel">
      <div className="ops-detail-head">
        <div><span className="eyebrow">{detail.order.orderCode}</span><h2>{detail.order.offering?.name}</h2><p className="muted">{detail.order.merchant?.name} · {detail.order.merchant?.email}</p></div>
        <button className="btn" onClick={()=>{setDetail(null);setSelected(null)}}>Fechar</button>
      </div>

      <div className="ops-detail-grid">
        <div>
          <div className="ops-section-title">Pagamento</div>
          <div className="ops-payment-box">
            <div><span>Estado</span><strong>{detail.order.paymentStatus}</strong></div>
            <div><span>Valor</span><strong>{detail.order.paymentAmount?.toLocaleString()} {detail.order.paymentCurrency}</strong></div>
          </div>
          {detail.order.paymentStatus!=='PAID'&&<div className="ops-action-box">
            <div className="field"><label>Referência / comprovativo</label><input value={proofReference} onChange={e=>setProofReference(e.target.value)} placeholder="Ex.: comprovativo recebido via WhatsApp"/></div>
            <div className="field"><label>Nota</label><textarea value={paymentNote} onChange={e=>setPaymentNote(e.target.value)} /></div>
            <button className="btn primary" disabled={busy} onClick={confirmPayment}>Confirmar pagamento manualmente</button>
            <p className="muted small">Esta ação não cria Transaction nem WalletMovement.</p>
          </div>}

          <div className="ops-section-title">Workflow</div>
          <div className="ops-steps">{detail.steps.map(step=><div className="ops-step-row" key={step.id}>
            <div><b>{String(step.position).padStart(2,'0')} · {step.label}</b><small>{step.code}</small></div>
            <select value={step.status} disabled={busy} onChange={e=>updateStep(step,e.target.value)}>{STEP_STATES.map(s=><option key={s}>{s}</option>)}</select>
          </div>)}</div>
        </div>

        <div>
          <div className="ops-section-title">Gestão interna</div>
          <div className="field"><label>Responsável</label><input value={assignedTo} onChange={e=>setAssignedTo(e.target.value)} placeholder="Nome / equipa"/></div>
          <div className="field"><label>Notas internas</label><textarea rows={5} value={internalNotes} onChange={e=>setInternalNotes(e.target.value)} /></div>
          <button className="btn" disabled={busy} onClick={saveOrderMeta}>Guardar</button>

          <div className="ops-section-title">Entregáveis / Assets</div>
          <div className="ops-assets">{detail.assets.length===0?<p className="muted">Ainda não existem assets.</p>:detail.assets.map(a=><div className="ops-asset" key={a.id}><b>{a.kind}</b><span>{a.label || a.valueText || a.url}</span>{a.sensitive&&<em>Sensível</em>}</div>)}</div>
          <form onSubmit={addAsset} className="ops-action-box">
            <div className="field"><label>Tipo</label><select value={assetKind} onChange={e=>setAssetKind(e.target.value)}>{ASSET_KINDS.map(k=><option key={k}>{k}</option>)}</select></div>
            <div className="field"><label>Label</label><input value={assetLabel} onChange={e=>setAssetLabel(e.target.value)} /></div>
            <div className="field"><label>Valor</label><input value={assetValue} onChange={e=>setAssetValue(e.target.value)} /></div>
            <div className="field"><label>URL</label><input value={assetUrl} onChange={e=>setAssetUrl(e.target.value)} /></div>
            <label className="ops-check"><input type="checkbox" checked={assetSensitive} onChange={e=>setAssetSensitive(e.target.checked)} /> Conteúdo sensível</label>
            <button className="btn primary" disabled={busy}>Adicionar asset</button>
          </form>

          <div className="ops-section-title">Auditoria</div>
          <div className="ops-audit">{detail.audit.slice(0,12).map((a:any)=><div key={a.id}><b>{a.action}</b><span>{new Date(a.createdAt).toLocaleString()}</span></div>)}</div>
        </div>
      </div>
    </section>}
  </div>;
}
