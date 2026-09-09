'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { services } from '@/lib/services';

type Currency = 'EUR' | 'BRL' | 'USDT';

export default function RegisterMerchantClient({ initialService }: { initialService?: string }) {
  const router = useRouter();
  const selected = useMemo(
    () => services.find(service => service.slug === initialService),
    [initialService]
  );

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState('');

  const selectedAmount = selected?.prices[currency] || 0;

  async function register(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('A password deve ter pelo menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As passwords não coincidem.');
      return;
    }

    setBusy(true);

    try {
      setStage('A criar a sua conta Merchant XPAYMENTS…');
      const registration = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, companyName, email, password })
      });

      const registrationPayload = await registration.json().catch(() => ({}));
      if (!registration.ok) {
        throw new Error(
          registrationPayload?.error?.message || 'Não foi possível criar a conta Merchant.'
        );
      }

      if (!selected) {
        setStage('Conta criada. A abrir a Área Merchant…');
        router.push('/portal?welcome=1');
        router.refresh();
        return;
      }

      setStage('Conta criada. A abrir a contratação selecionada…');
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offeringCode: selected.code,
          currency,
          notes: 'Contratação iniciada durante o registo no XPay.Expert.'
        })
      });

      const orderPayload = await orderResponse.json().catch(() => ({}));
      if (!orderResponse.ok) {
        // A conta já está criada e autenticada. Leva o Merchant ao portal
        // com o serviço preservado para que possa repetir apenas a criação da Order.
        const message = orderPayload?.error?.message || 'A conta foi criada, mas a contratação precisa de ser iniciada no portal.';
        setError(message);
        router.push(`/portal?service=${encodeURIComponent(selected.slug)}&welcome=1`);
        router.refresh();
        return;
      }

      const orderId = orderPayload?.data?.order?.id || '';
      const orderCode = orderPayload?.data?.order?.orderCode || '';
      const query = new URLSearchParams({
        service: selected.slug,
        welcome: '1'
      });
      if (orderId) query.set('order', orderId);
      if (orderCode) query.set('orderCode', orderCode);

      router.push(`/portal?${query.toString()}`);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || 'Não foi possível concluir o registo.');
      setStage('');
    } finally {
      setBusy(false);
    }
  }

  return <div className="signup-shell">
    <section className="signup-copy">
      <span className="eyebrow">XPAYMENTS Merchant</span>
      <h1>{selected ? 'Crie a conta e avance diretamente.' : 'Crie a sua conta Merchant.'}</h1>
      <p className="muted">
        A sua conta é criada no ecossistema XPAYMENTS e fica imediatamente disponível no XPay.Expert.
        {selected ? ' Depois do registo, abrimos automaticamente a contratação da estrutura escolhida.' : ''}
      </p>

      <div className="signup-benefits">
        <div><b>01</b><span>Conta Merchant XPAYMENTS</span></div>
        <div><b>02</b><span>Área Merchant e tracking</span></div>
        <div><b>03</b><span>Wallet EUR + XPAY Sandbox TEST</span></div>
        <div><b>04</b><span>Contratação XPay.Expert</span></div>
      </div>

      {selected && <div className={`signup-selected ${selected.premium ? 'premium' : ''}`}>
        <div className="country-head">
          <div className="flag" aria-hidden="true">{selected.flag}</div>
          <div>
            <div className="tag">Estrutura selecionada</div>
            <strong>{selected.name}</strong>
          </div>
        </div>
        {selected.premium && <div className="premium-glow">{selected.settlementLabel || 'Liquidação D0–1'}</div>}
        <div className="badges">
          {selected.availability && <span className="badge availability-badge">{selected.availability}</span>}
          <span className="badge">{selected.leadTime}</span>
        </div>
      </div>}
    </section>

    <section className="panel signup-form-card">
      <div className="kicker">Novo Merchant</div>
      <h2>{selected ? 'Criar conta e contratar' : 'Criar conta Merchant'}</h2>
      <p className="muted">Preencha os dados abaixo. A sessão ficará iniciada automaticamente.</p>

      <form onSubmit={register}>
        <div className="field">
          <label>Nome</label>
          <input value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
        </div>
        <div className="field">
          <label>Empresa / projeto <span className="muted">(opcional)</span></label>
          <input value={companyName} onChange={e => setCompanyName(e.target.value)} autoComplete="organization" />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
        </div>
        <div className="field">
          <label>Confirmar password</label>
          <input type="password" minLength={8} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
        </div>

        {selected && <>
          <div className="divider" />
          <div className="field">
            <label>Moeda da contratação</label>
            <select value={currency} onChange={e => setCurrency(e.target.value as Currency)}>
              <option value="EUR">EUR — Transferência SEPA</option>
              <option value="BRL">BRL — PIX</option>
              <option value="USDT">USDT — Crypto</option>
            </select>
          </div>
          <div className="signup-price">
            <span>Valor da estrutura</span>
            <strong>{selectedAmount.toLocaleString(currency === 'BRL' ? 'pt-BR' : 'pt-PT')} {currency}</strong>
          </div>
        </>}

        {error && <p className="error">{error}</p>}
        {stage && <p className="success">{stage}</p>}

        <button className="btn primary signup-submit" disabled={busy}>
          {busy ? 'A preparar a sua conta…' : selected ? 'Criar conta e avançar para pagamento' : 'Criar conta Merchant'}
        </button>
      </form>

      <div className="divider" />
      <p className="muted" style={{fontSize:13}}>
        Já tem conta? <a className="wa" href={selected ? `/portal?service=${selected.slug}` : '/portal'}>Entrar na Área Merchant →</a>
      </p>
    </section>
  </div>;
}
