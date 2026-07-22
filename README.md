# XPay.Expert — Enterprise Payments Infrastructure

<div align="center">

![XPay.Expert](public/logo.svg#gh-dark-mode-only)

**Plataforma de infraestrutura de pagamentos empresarial**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-New_York-18181B?logo=shadcnui)](https://ui.shadcn.com/)
[![PWA](https://img.shields.io/badge/PWA-Installable-4CAF50?logo=pwa)](#pwa--instalavel-no-celular-e-pc)

[Demo Live](https://xpay.expert) · [API Docs](https://api.xpay.expert) · [Suporte](https://t.me/XPay_Manager)

</div>

---

## Índice

- [Visão Geral](#visao-geral)
- [Arquitetura](#arquitetura)
  - [Diagrama de Fluxo](#diagrama-de-fluxo)
  - [Stack Técnico](#stack-tecnico)
- [Funcionalidades](#funcionalidades)
  - [Commerce](#commerce)
  - [Banking (Private Beta)](#banking-private-beta)
  - [Advisory](#advisory)
  - [Admin Console](#admin-console)
- [Fluxo API Completo](#fluxo-api-completo)
  - [Convenção de Envelope](#convencao-de-envelope)
  - [Autenticação](#autenticacao)
  - [Endpoints Merchant](#endpoints-merchant)
  - [Endpoints Admin](#endpoints-admin)
- [PWA — Instalável no Celular e PC](#pwa--instalavel-no-celular-e-pc)
- [i18n — Internacionalização](#i18n--internacionalizacao)
- [Feature Flags](#feature-flags)
- [Deploy na Vercel](#deploy-na-vercel)
  - [Variáveis de Ambiente](#variaveis-de-ambiente)
  - [Configuração do Projeto](#configuracao-do-projeto)
  - [Pipeline CI/CD](#pipeline-cicd)
- [Desenvolvimento Local](#desenvolvimento-local)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Segurança](#seguranca)
- [Roadmap](#roadmap)

---

## Visão Geral

O **XPay.Expert** é uma aplicação frontend (SPA/SSR) que serve como painel de controlo para a plataforma de pagamentos empresarial XPay. A aplicação **não possui base de dados própria** — toda a persistência, lógica de negócio e dados são geridos pelo backend API em `https://api.xpay.expert/api/v1`.

O frontend é responsável por:

- **Autenticação** JWT com sessão em memória + Zustand persist
- **Dashboard** com KPIs, gráficos, tabelas de transações, wallets, payouts
- **Gestão de Payouts** com wizard de 5 passos e idempotência
- **Admin Console** com capability probe e gestão operacional
- **PWA** instalável em celular (Android/iOS) e PC (Chrome/Edge)
- **i18n** em 4 idiomas (EN, PT-BR, FR, ES)

---

## Arquitetura

### Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────────────────┐
│                        XPay.Expert Frontend                      │
│                     (Next.js 16 + React 19)                     │
│                                                                   │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐              │
│  │  Landing  │  │   Auth       │  │  Dashboard     │              │
│  │  Page     │  │  /login      │  │  Shell         │              │
│  │  (SSR)    │  │  /register   │  │  (Protected)   │              │
│  └──────────┘  └──────┬───────┘  └───────┬───────┘              │
│                       │                  │                       │
│               ┌───────▼───────┐  ┌───────▼────────┐             │
│               │  Zustand Auth  │  │  Product Areas  │             │
│               │  (persist)     │  │  ┌───────────┐ │             │
│               └───────┬───────┘  │  │ Commerce  │ │             │
│                       │          │  │ Banking   │ │             │
│               ┌───────▼───────┐  │  │ Advisory  │ │             │
│               │ Axios Clients │  │  │ Admin     │ │             │
│               │ ┌───────────┐ │  │  └───────────┘ │             │
│               │ │  public   │ │  └───────┬────────┘             │
│               │ │  private  │ │          │                       │
│               │ │  (JWT)    │ │  ┌───────▼────────┐             │
│               │ └─────┬─────┘  │  React Query     │             │
│               └───────┼───────┘  │  (TanStack v5)  │             │
│                       │          └───────┬────────┘             │
│                       │                  │                       │
└───────────────────────┼──────────────────┼───────────────────────┘
                        │                  │
                   ┌────▼──────────────────▼────┐
                   │    Backend API v1          │
                   │  api.xpay.expert/api/v1    │
                   │                             │
                   │  ┌───────────────────────┐  │
                   │  │  Auth (login/register)│  │
                   │  │  Platform Bootstrap   │  │
                   │  │  Wallets & Treasury   │  │
                   │  │  Transactions         │  │
                   │  │  Merchant Payouts     │  │
                   │  │  Settlements          │  │
                   │  │  Admin Operations     │  │
                   │  │  KYC / Risk / Revenue │  │
                   │  └───────────────────────┘  │
                   └─────────────────────────────┘
```

### Stack Técnico

| Camada | Tecnologia | Versão |
|---|---|---|
| **Framework** | Next.js (App Router) | 16.1 |
| **UI Runtime** | React | 19 |
| **Linguagem** | TypeScript | 5 |
| **Estilo** | Tailwind CSS | 4 |
| **Componentes** | shadcn/ui (New York) | latest |
| **Ícones** | Lucide React | latest |
| **Estado Cliente** | Zustand | 5 |
| **Estado Servidor** | TanStack React Query | 5.82 |
| **HTTP Client** | Axios | 1.18 |
| **Formulários** | React Hook Form + Zod | 7 / 4 |
| **Tabelas** | TanStack React Table | 8 |
| **Gráficos** | Recharts | 2.15 |
| **Animações** | Framer Motion | 12 |
| **Temas** | next-themes (dark-first) | 0.4 |
| **Notificações** | Sonner | 2 |
| **Deploy** | Vercel (standalone) | — |

> **Nota:** Não existe base de dados local. O Prisma/SQLite presente no repositório é scaffold não utilizado — toda a dados flui via API REST.

---

## Funcionalidades

### Commerce

| Funcionalidade | Rota | Status | Descrição |
|---|---|---|---|
| Dashboard | `/commerce/overview` | **Operacional** | KPIs, gráficos, atividade recente via `platform/bootstrap` |
| Pagamentos | `/commerce/payments` | **Operacional** | Lista de transações com filtros e paginação |
| Carteiras | `/commerce/wallets` | **Operacional** | Saldos multi-moeda via `GET /wallets` |
| Settlements | `/commerce/settlements` | **Operacional** | Liquidações com filtros |
| Payouts | `/commerce/payouts` | **Operacional** | Lista + Detalhe + Criação (wizard 5 passos) |
| Novo Payout | `/commerce/payouts/new` | **Operacional** | Wizard: Origem → Destino → Validação → Confirmação → Criado |
| Lojas | `/commerce/stores` | **Operacional** | CRUD de lojas |
| Produtos | `/commerce/products` | **Operacional** | Gestão de produtos |
| Clientes | `/commerce/customers` | **Operacional** | Lista de clientes |
| Subscrições | `/commerce/subscriptions` | **Operacional** | Gestão de subscrições |
| Links de Pagamento | `/commerce/payment-links` | **Operacional** | Gestão de payment links |
| Faturas | `/commerce/invoices` | **Operacional** | Gestão de faturas |
| Transacções | `/commerce/transactions` | **Operacional** | Lista detalhada de transações |

### Banking (Private Beta)

| Funcionalidade | Rota | Status |
|---|---|---|
| Dashboard Banking | `/banking` | **Feature Flag OFF** |
| Contas | `/banking/accounts` | **Feature Flag OFF** |
| Cartões | `/banking/cards` | **Feature Flag OFF** |
| Crypto | `/banking/crypto` | **Feature Flag OFF** |
| FX | `/banking/fx` | **Feature Flag OFF** |
| Transferências | `/banking/transfers` | **Feature Flag OFF** |

### Advisory

| Funcionalidade | Rota | Status |
|---|---|---|
| Dashboard Advisory | `/advisory` | **Operacional** (empty state) |
| Casos | `/advisory/cases` | **Feature Flag OFF** |
| Documentos | `/advisory/documents` | **Feature Flag OFF** |
| Mensagens | `/advisory/messages` | **Feature Flag OFF** |
| Serviços | `/advisory/services` | **Operacional** (empty state) |

### Admin Console

| Funcionalidade | Rota | Status | Descrição |
|---|---|---|---|
| Admin Dashboard | `/admin` | **Operacional** | Visão geral da plataforma |
| Merchants | `/admin/commerce/merchants` | **Operacional** | Gestão de merchants |
| Payouts (Admin) | `/admin/commerce/payouts` | **Operacional** | Operações: aprovar, rejeitar, processar, marcar pago |
| Payout Detail | `/admin/commerce/payouts/[id]` | **Operacional** | Detalhe + ações administrativas |
| Gateways | `/admin/commerce/gateways` | **Operacional** | Gestão de gateways de pagamento |
| Settlements | `/admin/commerce/settlements` | **Operacional** | Liquidações globais |
| KYC Queue | `/admin/kyc` | **Operacional** | Fila de revisão KYC |
| Revenue | `/admin/revenue` | **Operacional** | Receitas da plataforma |
| Risk | `/admin/risk` | **Operacional** | Análise de risco |
| System Health | `/admin/system/health` | **Operacional** | Saúde do sistema |
| Workers | `/admin/system/workers` | **Operacional** | Monitorização de workers |
| Queues | `/admin/system/queues` | **Operacional** | Monitorização de filas |
| Logs | `/admin/system/logs` | **Operacional** | Logs do sistema |
| Feature Flags | `/admin/system/feature-flags` | **Operacional** | Gestão de feature flags |

---

## Fluxo API Completo

### Convenção de Envelope

Todas as respostas da API seguem o envelope padrão v3.1:

```typescript
// Sucesso
{
  "success": true,
  "data": T,          // Payload tipado
  "meta"?: {          // Opcional, para listas paginadas
    "total": number,
    "page": number,
    "limit": number,
    "pages": number
  }
}

// Erro
{
  "success": false,
  "error": {
    "code": string,     // ex: "UNAUTHORIZED", "VALIDATION_ERROR"
    "message": string   // Mensagem legível
  }
}
```

### Autenticação

```
POST /auth/login          → { token, merchant }
POST /auth/register       → { token, merchant }
GET  /auth/me             → User (valida sessão)
POST /auth/logout         → void (invalida sessão backend)
```

**Fluxo:**

1. Utilizador faz login → recebe `token` JWT
2. Token guardado em Zustand (`useAuth`) e injetado no `privateApi` via interceptor
3. Token **não** é persistido em `localStorage` diretamente — fica em memória via `setPrivateAccessToken()`
4. O Zustand persist apenas metadados (sem o token)
5. Em 401: token limpo, sessão destruída, redirect para `/login`
6. Em 403: **não** limpa sessão — mostra "Access denied"
7. **Não existem refresh tokens** — sessão expira após ~8h

### Endpoints Merchant

| Domain | Método | Endpoint | Descrição |
|---|---|---|---|
| **Platform** | GET | `/platform/bootstrap` | Dados completos do dashboard (KPIs, alertas, ações rápidas) |
| **Profile** | GET | `/merchant/profile` | Perfil do merchant |
| **Profile** | PATCH | `/merchant/profile` | Atualizar perfil |
| **Stores** | GET | `/merchant/stores` | Lista de lojas |
| **Stores** | POST | `/merchant/stores` | Criar loja |
| **Stores** | GET | `/merchant/stores/:id` | Detalhe da loja |
| **Stores** | PATCH | `/merchant/stores/:id` | Atualizar loja |
| **Wallets** | GET | `/wallets` | Carteiras e saldos |
| **Transactions** | GET | `/transactions` | Lista paginada de transações |
| **Transactions** | GET | `/transactions/stats` | Estatísticas de transações |
| **Analytics** | GET | `/analytics/overview` | Overview analítico |
| **Risk** | GET | `/risk/profile` | Perfil de risco |
| **Treasury** | GET | `/treasury/overview` | Overview de tesouraria |
| **Customers** | GET | `/customers` | Lista de clientes |
| **Products** | GET | `/products` | Lista de produtos |
| **Products** | POST | `/products` | Criar produto |
| **Products** | DELETE | `/products/:id` | Eliminar produto |
| **Payment Links** | GET | `/payment-links` | Lista de payment links |
| **Invoices** | GET | `/invoices` | Lista de faturas |
| **Subscriptions** | GET | `/subscriptions` | Lista de subscrições |
| **Settlements** | GET | `/merchant/settlements` | Liquidações do merchant |
| **API Keys** | GET | `/api-keys` | Lista de chaves API |
| **API Keys** | POST | `/api-keys` | Criar chave API |
| **API Keys** | DELETE | `/api-keys/:id` | Revogar chave API |
| **Webhooks** | GET | `/webhooks` | Lista de webhooks |
| **Webhooks** | POST | `/webhooks` | Criar webhook |
| **Webhooks** | PATCH | `/webhooks/:id` | Atualizar webhook |
| **Webhooks** | DELETE | `/webhooks/:id` | Eliminar webhook |

### Endpoints Merchant Payouts

| Método | Endpoint | Header | Descrição |
|---|---|---|---|
| GET | `/merchant/payouts/options` | — | Opções disponíveis (métodos, moedas, limites) |
| POST | `/merchant/payouts/validate` | — | Validação pré-criação (FX, limites) |
| POST | `/merchant/payouts` | `Idempotency-Key` | Criar payout (com idempotência) |
| GET | `/merchant/payouts` | — | Lista paginada de payouts |
| GET | `/merchant/payouts/:id` | — | Detalhe do payout |
| POST | `/merchant/payouts/:id/cancel` | — | Cancelar payout |

**Métodos de Payout suportados:**

| Método | Descrição | Campos Destino |
|---|---|---|
| `SEPA_INSTANT` | Transferência SEPA Instant | IBAN, BIC, Bank Name, Country |
| `PIX` | Pix (Brasil) | Key Type (CPF/CNPJ/EMAIL/PHONE/EVP), Key Value, Tax ID |
| `USDT_TRC20` | USDT na rede TRC20 | Wallet Address |
| `USDT_ERC20` | USDT na rede ERC20 | Wallet Address |
| `MANUAL` | Transferência manual | Instructions |

**Wizard de Criação (5 passos):**

```
Passo 1: Origem    → Selecionar wallet e moeda de origem
Passo 2: Destino   → Formulário dinâmico por método (SEPA/PIX/USDT/MANUAL)
Passo 3: Validação → POST /validate → mostra FX, taxas, valor final
Passo 4: Confirmação → Resumo completo, botão "Confirmar Payout"
Passo 5: Criado    → Sucesso com ticket code, redireciona para /commerce/payouts/[id]
```

> **Idempotência:** Um UUID é gerado no início do wizard e mantido entre retries. O header `Idempotency-Key` é enviado na criação do payout.

### Endpoints Admin

| Método | Endpoint | Descrição |
|---|---|---|
| **Capability Probe** | | |
| GET | `/admin/merchant-payouts?limit=1` | 200 = admin, 403 = não admin, 401 = sessão inválida |
| **Payouts** | | |
| GET | `/admin/merchant-payouts` | Lista todos os payouts (todos merchants) |
| GET | `/admin/merchant-payouts/:id` | Detalhe do payout |
| POST | `/admin/merchant-payouts/:id/fx-quote` | Aplicar cotação FX |
| POST | `/admin/merchant-payouts/:id/approve` | Aprovar payout |
| POST | `/admin/merchant-payouts/:id/processing` | Marcar como processando |
| POST | `/admin/merchant-payouts/:id/paid` | Marcar como pago |
| POST | `/admin/merchant-payouts/:id/reject` | Rejeitar payout |
| **Settlements** | | |
| GET | `/admin/settlements` | Liquidações globais |
| **Merchants** | | |
| GET | `/admin/merchants` | Lista de merchants |
| **KYC** | | |
| GET | `/admin/kyc` | Fila de revisão KYC |
| **System** | | |
| GET | `/admin/health` | Saúde do sistema |
| GET | `/admin/revenue` | Receitas da plataforma |

---

## PWA — Instalável no Celular e PC

A aplicação está configurada como **Progressive Web App** e pode ser instalada em:

- **Android** (Chrome) — prompt automático de instalação
- **iOS** (Safari) — botão de partilha → "Adicionar ao Ecrã Inicial"
- **PC** (Chrome/Edge) — ícone de instalação na barra de endereço
- **PC** (PWA standalone) — abre como janela dedicada sem barra de navegador

### Configuração PWA

| Item | Ficheiro | Descrição |
|---|---|---|
| Manifest | `src/app/manifest.ts` | Metadados, ícones, shortcuts |
| Service Worker | `public/sw.js` | Cache offline, precache de assets estáticos |
| SW Registration | `src/lib/pwa/register-sw.ts` | Registo condicional do service worker |
| Ícones | `public/icon-{192,512}.png` | Ícones padrão PNG |
| Ícones Maskable | `public/icon-maskable-{192,512}.png` | Ícones adaptáveis para Android |
| Favicon SVG | `public/favicon.svg` | Ícone vetorial para browser |
| Apple Touch | `public/apple-touch-icon.png` | Ícone para iOS |
| OG Image | `public/og-image.png` | Imagem de partilha em redes sociais |

### Shortcuts PWA

| Atalho | Rota |
|---|---|
| Dashboard | `/commerce/overview` |
| Payments | `/commerce/payments` |
| Wallets | `/commerce/wallets` |

### Service Worker Strategy

- **Precache:** Assets estáticos (JS, CSS, fonts, ícones) no primeiro load
- **Network-first:** Requisições à API (sempre online, mostra erro se offline)
- **Stale-while-revalidate:** Páginas estáticas (landing, login)
- **Cache max age:** 24h para assets estáticos, sem cache para API

---

## i18n — Internacionalização

O sistema de i18n é **client-side** com 4 idiomas:

| Código | Idioma | Ficheiro |
|---|---|---|
| `en` | English | `src/lib/i18n/locales.ts` |
| `pt-BR` | Português (Brasil) | `src/lib/i18n/locales.ts` |
| `fr` | Français | `src/lib/i18n/locales.ts` |
| `es` | Español | `src/lib/i18n/locales.ts` |

**Detecção automática:** (1) preferência persistida → (2) língua do browser → (3) timezone

**Uso nos componentes:**

```typescript
import { useT, useLocale } from "@/lib/i18n";

function MyComponent() {
  const t = useT();
  const locale = useLocale();
  return <h1>{t("nav.dashboard")}</h1>; // → "Dashboard" / "Painel" / "Tableau de bord"
}
```

**Switcher:** Disponível no Dashboard Shell (ícone de globo no topo da sidebar).

---

## Feature Flags

Controlo centralizado em `src/config/feature-flags.ts`:

```typescript
const features = {
  commerce: true,           // ✅ Ativo
  merchantPayouts: true,    // ✅ Ativo
  settlements: true,        // ✅ Ativo
  adminConsole: true,       // ✅ Ativo
  banking: false,           // 🔒 Private Beta
  advisory: true,           // ✅ Ativo (área geral)
  advisoryCases: false,     // 🔒 Em desenvolvimento
  advisoryDocuments: false, // 🔒 Em desenvolvimento
  advisoryMessages: false,  // 🔒 Em desenvolvimento
  discordNotifications: false,
  emailNotifications: false,
  whatsappNotifications: false,
};
```

**Uso:**

```typescript
import { isFeatureEnabled } from "@/config/feature-flags";

if (isFeatureEnabled("banking")) {
  // Mostrar funcionalidade
}
```

---

## Deploy na Vercel

### Variáveis de Ambiente

Crie um ficheiro `.env.local` (não commitar) ou configure na Vercel Dashboard:

```bash
# Obrigatório — URL da API Backend
NEXT_PUBLIC_API_URL=https://api.xpay.expert/api/v1

# Opcional — URL do site (para metadados/SEO)
NEXT_PUBLIC_SITE_URL=https://xpay.expert

# Opcional — Prisma/SQLite (não utilizado pela app, pode omitir)
# DATABASE_URL=file:./db/dev.db
```

| Variável | Obrigatória | Default | Descrição |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | **Sim** | `https://api.xpay.expert/api/v1` | URL base da API backend |
| `NEXT_PUBLIC_SITE_URL` | Não | `https://xpay.expert` | URL pública do site (meta, sitemap, OG) |
| `DATABASE_URL` | Não | — | Não utilizado pela app em produção |

### Configuração do Projeto

**`next.config.ts`:**

```typescript
{
  output: "standalone",              // Otimizado para Vercel/Docker
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
  allowedDevOrigins: ["*.space-z.ai", "*.chat.z.ai"],
}
```

**`vercel.json` (não necessário):** O Next.js 16 com `output: "standalone"` é automaticamente detetado e otimizado pela Vercel.

### Pipeline CI/CD

```
Push para main
  → Vercel deteta mudanças
  → Build automático (bun install && next build)
  → Deploy para produção
  → URL: https://xpay.expert
```

**Passos manuais na Vercel Dashboard:**

1. **Import Project** → ligar ao GitHub `nexflowx-hub/xpay.expert`
2. **Framework Preset:** Next.js (auto-detected)
3. **Build Command:** `npx next build` (Vercel usa isto por default)
4. **Environment Variables:** adicionar `NEXT_PUBLIC_API_URL` e `NEXT_PUBLIC_SITE_URL`
5. **Deploy**

> **Nota:** A Vercel utiliza `npm` por default. Se preferir `bun`, ative "Bun" nas Settings do projeto ou use o Vercel Build API v2.

---

## Desenvolvimento Local

```bash
# Clonar
git clone https://github.com/nexflowx-hub/xpay.expert.git
cd xpay.expert

# Instalar dependências
bun install

# Variáveis de ambiente (criar .env.local)
echo "NEXT_PUBLIC_API_URL=https://api.xpay.expert/api/v1" > .env.local

# Iniciar em desenvolvimento
bun run dev
# → http://localhost:3000

# Verificar qualidade do código
bun run lint
```

**Scripts disponíveis:**

| Script | Comando | Descrição |
|---|---|---|
| `dev` | `next dev -p 3000` | Servidor de desenvolvimento |
| `build` | `next build` + copy static | Build de produção (standalone) |
| `start` | `NODE_ENV=production bun .next/standalone/server.js` | Servidor de produção |
| `lint` | `eslint .` | Verificação de qualidade |

---

## Estrutura do Projeto

```
xpay.expert/
├── public/
│   ├── favicon.svg, favicon-32.png
│   ├── logo.svg, logo.png, logo-1024.png, logo-symbol.svg
│   ├── og-image.png                          # Open Graph image
│   ├── apple-touch-icon.png                  # iOS PWA icon
│   ├── icon-192.png, icon-512.png            # PWA icons
│   ├── icon-maskable-192.png, -512.png       # Android maskable icons
│   ├── robots.txt                            # Robots.txt estático
│   ├── sw.js                                 # Service Worker (PWA)
│   └── payment-logos/                        # SVGs: visa, mastercard, pix, etc.
├── prisma/
│   └── schema.prisma                         # Schema scaffold (não utilizado)
├── src/
│   ├── app/
│   │   ├── layout.tsx                        # Root layout + metadata + SEO
│   │   ├── page.tsx                          # Landing page (SSR)
│   │   ├── globals.css                       # Estilos globais Tailwind
│   │   ├── manifest.ts                       # PWA manifest
│   │   ├── sitemap.ts                        # Sitemap dinâmico
│   │   ├── robots.ts                         # Robots.txt dinâmico
│   │   ├── error.tsx                         # Error boundary
│   │   ├── not-found.tsx                     # 404 page
│   │   ├── (auth)/                           # Login + Register
│   │   ├── (dashboard)/                      # App protegida (MerchantGuard)
│   │   │   ├── layout.tsx                    # DashboardShell wrapper
│   │   │   ├── admin/                        # Admin (AdminGuard)
│   │   │   ├── advisory/                     # Advisory area
│   │   │   ├── banking/                      # Banking area (feature flag)
│   │   │   ├── commerce/                     # Commerce (main)
│   │   │   │   ├── overview/
│   │   │   │   ├── payments/
│   │   │   │   ├── wallets/
│   │   │   │   ├── settlements/
│   │   │   │   ├── payouts/                  # List + New (wizard) + [id]
│   │   │   │   ├── stores/
│   │   │   │   ├── products/
│   │   │   │   ├── customers/
│   │   │   │   ├── subscriptions/
│   │   │   │   ├── payment-links/
│   │   │   │   ├── invoices/
│   │   │   │   └── transactions/
│   │   │   ├── developers/
│   │   │   ├── insights/
│   │   │   ├── risk/
│   │   │   ├── settings/
│   │   │   └── support/
│   │   └── (protected)/                      # Rotas legacy com redirect
│   ├── components/
│   │   ├── ui/                               # ~45 componentes shadcn/ui
│   │   ├── admin/                            # Componentes admin (13)
│   │   ├── auth/                             # Auth screen
│   │   ├── dashboard/                        # Shell, Guards
│   │   ├── landing/                          # Landing page
│   │   ├── merchant/                         # Componentes merchant (17)
│   │   └── shared/                           # StatCard, PageHeader, etc.
│   ├── config/
│   │   ├── index.ts                          # Nav, product areas, currencies
│   │   ├── feature-flags.ts                  # Feature flags centralizados
│   │   └── contacts.ts                       # Telegram, Discord, WhatsApp
│   ├── hooks/
│   │   ├── use-queries.ts                    # TanStack Query hooks (principal)
│   │   ├── queries.ts                        # Legacy hooks (deprecated)
│   │   ├── use-toast.ts                      # Toast hook
│   │   └── use-mobile.ts                     # Mobile detection hook
│   ├── lib/
│   │   ├── api/
│   │   │   ├── public-client.ts              # Axios sem JWT
│   │   │   ├── private-client.ts             # Axios com JWT interceptor
│   │   │   └── endpoints.ts                  # Funções de endpoint (40+)
│   │   ├── i18n/
│   │   │   ├── index.ts                      # useI18n store, useT(), useLocale()
│   │   │   └── locales.ts                    # Dicionários EN/PT-BR/FR/ES
│   │   ├── pwa/
│   │   │   └── register-sw.ts                # Service worker registration
│   │   ├── storage/xp-storage.ts             # Centralized localStorage
│   │   ├── db.ts                             # Prisma client (não utilizado)
│   │   └── utils.ts                          # cn(), formatCurrency(), formatDate()
│   ├── providers/app-providers.tsx           # QueryClient + ThemeProvider
│   ├── stores/
│   │   ├── auth.ts                           # Auth state + JWT management
│   │   ├── platform.ts                       # Bootstrap data
│   │   ├── workspace.ts                      # Store/workspace selector
│   │   ├── ui.ts                             # UI state (sidebar, command palette)
│   │   └── admin.ts                          # Admin capability probe
│   └── types/index.ts                        # Todos os tipos (~818 linhas)
├── .env.example                              # Template de variáveis de ambiente
├── next.config.ts                            # Configuração Next.js
├── package.json                              # Dependências e scripts
├── tsconfig.json                             # Configuração TypeScript
├── components.json                           # shadcn/ui config
├── eslint.config.mjs                         # ESLint config
└── README.md                                 # Este ficheiro
```

---

## Segurança

| Regra | Implementação |
|---|---|
| **JWT em memória** | Token nunca vai para localStorage — apenas referência in-memory via `setPrivateAccessToken()` |
| **Sem refresh tokens** | Em 401, sessão é destruída e redirect para login |
| **403 preserva sessão** | "Access denied" não limpa o token |
| **Sem dados financeiros em persist** | Saldo/balances nunca são guardados em Zustand persist ou localStorage |
| **Sem optimistic updates** | Balances só atualizam após confirmação do servidor |
| **Sem console.log de tokens** | Interceptors não logam headers de autorização |
| **Idempotência em payouts** | UUID gerado no wizard, mantido em retries via header `Idempotency-Key` |
| **Admin capability probe** | Permissões verificadas via API (`GET /admin/merchant-payouts?limit=1`) |
| **Input sanitização** | React Hook Form + Zod para validação de formulários |
| **Timeout de API** | 15 segundos em todas as requisições |

---

## Roadmap

### Em Desenvolvimento 🔧
- **Banking Area** — Contas, cartões, FX, crypto, transferências
- **Advisory Cases** — Gestão de casos de consultoria
- **Advisory Documents** — Partilha de documentos
- **Advisory Messages** — Sistema de mensagens
- **Notificações** — Discord, Email, WhatsApp

### Planeado 📋
- **Offline PWA** — Cache de páginas para uso offline limitado
- **WebAuthn** — Autenticação por chave de segurança (FIDO2)
- **Dark/Light Toggle** — Alternância manual de tema
- **Real-time Updates** — WebSocket para transações em tempo real
- **Export CSV/PDF** — Exportação de relatórios
- **Command Palette** — Atalhos de teclado para navegação rápida

---

## Suporte

| Canal | Contacto |
|---|---|
| Telegram (Geral) | [@XPay_Expert](https://t.me/XPay_Expert) |
| Telegram (Suporte) | [@XPay_Manager](https://t.me/XPay_Manager) |
| Discord | [XPay Community](https://discord.gg/xpay) |
| WhatsApp | [Suporte WhatsApp](https://wa.me/xpay) |
| Email | [suporte@xpay.expert](mailto:suporte@xpay.expert) |

---

<div align="center">

**XPay.Expert** — Enterprise Payments Infrastructure

&copy; 2025 XPay Expert, Inc. Todos os direitos reservados.

</div>