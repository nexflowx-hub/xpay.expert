# XPay Expert

XPay Expert is the business-operations layer of XPAYMENTS: dedicated company structures, banking/acquiring onboarding, digital infrastructure and delivery tracking.

## Runtime
- Next.js 16
- Merchant authentication via XPAYMENTS API
- Service catalog on `xpay.expert`
- Merchant portal under `/portal`

## Server configuration
`XPAYMENTS_API_URL` is optional and defaults to `https://api.xpayments.digital`.

No provider credentials belong in this repository or in browser-exposed environment variables.
