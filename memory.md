# Project Memory

This file tracks the significant changes and fixes implemented in the project.

## Done
- **2026-07-09**: Addressed critical payment vulnerabilities.
  - Implemented server-side price calculation for order creation to prevent client-side price manipulation.
  - Secured the Razorpay order creation endpoint to fetch authoritative order totals from the database.
  - Blocked unauthenticated client-side API requests from setting order status to `confirmed` or payment attempt status to `success`.
  - Moved the responsibility of updating order and payment statuses upon successful payment from the frontend to the secure backend `verifyPayment` endpoint.

### Phase 2: Checkout Security Hardening (Shipping & Qty validation, Payment attempt server-side mapping)
- Hardened createOrder against manipulated shipping/quantities.
- Server-side attempt tracking to eliminate attempt hijacks.
- Whitelisted statuses for PATCH /api/orders/:id/status.

