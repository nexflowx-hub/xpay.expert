'use client';

import { useEffect, useState } from 'react';

type Proof={id:string;service_order_id:string;payment_method:string;payment_reference?:string;external_url?:string;note?:string;status:string;created_at?:string;order_code:string;merchant_name?:string;merchant_email?:string;offering_name?:string};
type DocumentRow={id:string;service_order_id:string;category:string;label?:string;original_name?:string;external_url?:string;status:string;created_at?:string;order_code:string;merchant_name?:string;merchant_email?:string;offering_name?:string;requirement_label?:string};

async function api(path:string,init?:RequestInit){
  const r=await fetch(`/api/ops/${path}`,{cache:'no-store',...init});
  const j=await r.json().catch(()=>({}));
  if(!r.ok) throw Object.assign(new Error(j?.error?.message||'Falha na operação.'),{status:r.status});
  return j;
}

export default function OpsIntakeClient(){
  const [mode,setMode]=useState<'loading'|'login'|'forbidden'|'ready'>('loading');
  const [proofs,setProofs]=useState<Proof[]>([]);
  const [documents,setDocuments]=useState<DocumentRow[]>([]);
  const [status,setStatus]=useState('SUBMITTED');
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState('');

  async function load(){
    setError('');
    try{
      await api('me');
      const p=await api(`intake-queue?status=${encodeURIComponent(status)}`);
      setProofs(p?.data?.paymentProofs||[]); setDocuments(p?.data?.documents||[]); setMode('ready');
    }catch(e:any){
      if(e?.status===401)setMode('login'); else if(e?.status===403)setMode('forbidden'); else {setError(e.message||'Falha.');setMode('login');}
    }
  }
  useEffect(()=>{load();},[status]);

  async function reviewProof(item:Proof,nextStatus:'APPROVED'|'REJECTED'){
    setBusy(item.id);setError('');setMessage('');
    try{
      await api(`orders/${item.service_order_id}/payment-proofs/${item.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:nextStatus,reviewNotes:`Revisto no Expert Ops Intake: ${nextStatus}`})});
      setMessage(`Comprovativo ${nextStatus.toLowerCase()}. A aprovação do comprovativo não altera o ledger nem confirma automaticamente a Order.`); await load();
    }catch(e:any){setError(e.message);}finally{setBusy('');}
  }

  async function reviewDocument(item:DocumentRow,nextStatus:'APPROVED'|'REJECTED'){
    setBusy(item.id);setError('');setMessage('');
    try{
      await api(`orders/${item.service_order_id}/documents/${item.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:nextStatus,reviewNotes:`Revisto no Expert Ops Intake: ${nextStatus}`})});
      setMessage(`Documento ${nextStatus.toLowerCase()}.`); await load();
    }catch(e:any){setError(e.message);}finally{setBusy('');}
  }

  if(mode==='loading')return <div className="login panel"><p className="muted">A carregar fila de intake…</p></div>;
  if(mode==='login')return <div className="login panel"><span className="eyebrow">Expert Operations</span><h1>Sessão necessária</h1><p className="muted">Entre primeiro em <a className="wa" href="/ops">/ops</a> com a conta interna autorizada.</p></div>;
  if(mode==='forbidden')return <div className="login panel"><span className="eyebrow">403</span><h1>Acesso não autorizado</h1></div>;

  return <div className="ops-shell">
    <header className="ops-topbar"><div><div className="brand">XPAY<span>.EXPERT</span></div><div className="kicker">Documentos & Comprovativos</div></div><div className="actions"><a className="btn" href="/ops">← Kanban</a><select className="ops-status-filter" value={status} onChange={e=>setStatus(e.target.value)}><option>SUBMITTED</option><option>REVIEWING</option><option>APPROVED</option><option>REJECTED</option><option value="">TODOS</option></select><button className="btn" onClick={load}>Atualizar</button></div></header>
    {error&&<div className="ops-alert error">{error}</div>}{message&&<div className="ops-alert success">{message}</div>}

    <section className="ops-intake-grid">
      <div className="panel"><div className="ops-section-title">Comprovativos de pagamento</div>{proofs.length===0?<p className="muted">Sem comprovativos neste estado.</p>:proofs.map(p=><article className="intake-review-card" key={p.id}><div className="ops-card-row"><b>{p.order_code}</b><span className="badge">{p.status}</span></div><h3>{p.offering_name}</h3><p className="muted">{p.merchant_name||p.merchant_email}</p><p><b>Método:</b> {p.payment_method}<br/><b>Referência:</b> {p.payment_reference||'—'}</p>{p.note&&<p className="muted">{p.note}</p>}{p.external_url&&<a className="wa" href={p.external_url} target="_blank" rel="noreferrer">Abrir ficheiro ↗</a>}<div className="actions"><button className="btn primary" disabled={busy===p.id} onClick={()=>reviewProof(p,'APPROVED')}>Aprovar comprovativo</button><button className="btn" disabled={busy===p.id} onClick={()=>reviewProof(p,'REJECTED')}>Rejeitar</button><a className="btn ghost" href={`/ops?order=${encodeURIComponent(p.service_order_id)}`}>Abrir Order</a></div></article>)}</div>

      <div className="panel"><div className="ops-section-title">Documentos do projeto</div>{documents.length===0?<p className="muted">Sem documentos neste estado.</p>:documents.map(d=><article className="intake-review-card" key={d.id}><div className="ops-card-row"><b>{d.order_code}</b><span className="badge">{d.status}</span></div><h3>{d.requirement_label||d.label||d.category}</h3><p className="muted">{d.offering_name} · {d.merchant_name||d.merchant_email}</p><p>{d.original_name||d.label||'Documento registado'}</p>{d.external_url&&<a className="wa" href={d.external_url} target="_blank" rel="noreferrer">Abrir documento ↗</a>}<div className="actions"><button className="btn primary" disabled={busy===d.id} onClick={()=>reviewDocument(d,'APPROVED')}>Aprovar</button><button className="btn" disabled={busy===d.id} onClick={()=>reviewDocument(d,'REJECTED')}>Rejeitar</button></div></article>)}</div>
    </section>
  </div>;
}
