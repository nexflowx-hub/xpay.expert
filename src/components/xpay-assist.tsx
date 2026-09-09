'use client';

import { useMemo, useState } from 'react';

const WA = '351925386409';

const QUICK = [
  { label: 'Quero uma estrutura pronta', text: 'Olá, quero uma estrutura empresarial pronta e gostaria de saber qual opção faz mais sentido para o meu projeto.' },
  { label: 'Projeto personalizado', text: 'Olá, preciso de um projeto personalizado e de uma cotação. Posso explicar a jurisdição e o objetivo da operação?' },
  { label: 'P2P / Crypto', text: 'Olá, preciso de apoio numa operação manual P2P/OTC envolvendo USDT, BTC, EUR ou BRL.' },
  { label: 'Gaming / licença', text: 'Olá, pretendo avaliar um projeto com licença Gaming ou uma jurisdição específica. Gostaria de pedir uma análise e cotação.' }
];

export default function XPayAssist() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const href = useMemo(() => {
    const text = message.trim() || 'Olá, estou no XPay.Expert e gostaria de falar com um especialista.';
    return `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  }, [message]);

  return <div className="assist-wrap">
    {open && <div className="assist-panel" role="dialog" aria-label="XPay Assist">
      <div className="assist-head">
        <div><span className="assist-live"/><strong>XPay Assist</strong><small>Atendimento inteligente · online</small></div>
        <button type="button" aria-label="Fechar" onClick={() => setOpen(false)}>×</button>
      </div>
      <div className="assist-body">
        <div className="assist-bubble">Olá! Posso ajudar a escolher uma estrutura, preparar um projeto personalizado ou encaminhar uma operação P2P/Crypto para a equipa.</div>
        <div className="assist-quick">{QUICK.map((item) => <button key={item.label} type="button" onClick={() => setMessage(item.text)}>{item.label}</button>)}</div>
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Descreva o que precisa..." rows={3}/>
        <a className="btn primary assist-send" href={href} target="_blank" rel="noreferrer">Continuar no WhatsApp ↗</a>
        <small className="assist-note">O chat prepara o pedido e transfere a conversa para um especialista XPay.</small>
      </div>
    </div>}
    <button className="assist-launch" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
      <span className="assist-spark">✦</span><span>{open ? 'Fechar' : 'Falar com XPay Assist'}</span>
    </button>
  </div>;
}
