# Prompy Interview Guide (Architecture + Implementation)

## 1) What this project is
Prompy is a production-oriented **AI Prompt Manager** with three major surfaces:
- **Chrome Extension (React + Vite, MV3)** for day-to-day prompt usage
- **Backend API (Node.js + Express + MongoDB)** for auth, prompt CRUD, limits, and subscriptions
- **Web App (Next.js)** for marketing and account/payment dashboards via API proxy routes

Use this as your interview script from demo to deep implementation details.

---

## 2) Recommended interview flow (what to present first)
1. **30-second product pitch**
2. **2–4 minute live demo** (happy path + one edge case)
3. **High-level architecture** and boundaries
4. **Key user flows** (Auth, Prompt CRUD, Caching, Subscription)
5. **Low-level code walk-through** (frontend + extension + backend)
6. **Major engineering decisions and trade-offs**
7. **Challenges and how we solved them**
8. **Q&A bank**
9. **Future roadmap**

---

## 3) 30-second pitch (opening statement)
“Prompy is a Chrome-first prompt management system for power AI users. It lets users securely store prompts, search and reuse them quickly, and scale usage with subscription tiers. The extension is optimized for speed through local caching, while the backend enforces identity, limits, and payment state consistently. We also provide a web surface for account and billing workflows.”

---

## 4) Demo script (2–4 min)

### Demo objective
Show product value and technical maturity quickly.

### Suggested sequence
1. **Login from extension** (Google OAuth)
2. **View prompt library** (search, tags, compact view toggle)
3. **Create a prompt with variables** (`${{variable}}` style placeholders)
4. **Open prompt detail and preview variable substitution**
5. **Copy prompt output in one click**
6. **Show prompt limit indicator** (free-tier vs unlimited behavior)
7. **Trigger refresh** to show cached + synced behavior
8. **Pop-out mode** to show UX optimization for active workflows

### What to narrate during demo
- “Prompt reads are optimized by local cache + sync window.”
- “Server still remains source of truth for prompt limits and subscription status.”
- “Authentication token is handled through extension storage and verified in backend JWT middleware.”

---

## 5) High-level architecture

## Components
- **Extension UI**: `src/` (React app)
- **Extension runtime integration**: `public/manifest.json`, `public/background.js`, `public/options.js`
- **Backend API**: `server/src/`
- **Web app + API proxies**: `web/src/app` + `web/src/lib/api.js`

## Core data path (extension)
1. User authenticates via Google OAuth route on backend.
2. Backend returns JWT; extension stores it in `chrome.storage.sync`.
3. Extension calls backend `/api/prompts` and `/api/user/stats` with Bearer token.
4. Prompt/user stats cached in `chrome.storage.local` for fast reads.
5. Backend enforces limits/subscription, persists in MongoDB.

## Security path
- Auth: Google OAuth + JWT
- Transport controls: CORS allowlist, Helmet CSP
- Abuse controls: rate limiters on payment/subscription endpoints

---

## 6) Low-level implementation deep dive (with code references)

## A) Extension shell and runtime behavior
- **MV3 manifest**: `/public/manifest.json`
  - Defines popup (`index.html`), service worker (`background.js`), options page, API host permissions.
- **Background service worker**: `/public/background.js`
  - Initializes defaults (`apiUrl`, `theme`, `syncFrequency`) on install.
  - Handles external message `auth_success` and stores JWT token.
  - Supports prompt fetch and pop-out window command.
- **Options persistence**: `/public/options.js`
  - Persists theme and sync frequency via `chrome.storage.sync`.

## B) Frontend app orchestration
- **Root app state + flow control**: `/src/App.jsx`
  - Handles auth check, prompt loading, error states, refresh, create/edit/delete flows.
  - Uses cached data first, then conditionally background-refreshes based on sync frequency.
  - Controls pop-out behavior and theme persistence.
- **Prompt list/search UX**: `/src/components/PromptList.jsx`
  - Uses **Fuse.js** fuzzy search over title/content.
  - Adds tag filters, sort options, compact mode preference in sync storage.
- **Variable templating UX**: `/src/components/PromptView.jsx`
  - Extracts `${{...}}` tokens and supports runtime substitution preview before copy.
- **Prompt limits UX**: `/src/components/PromptLimitIndicator.jsx`
  - Visualizes usage %, premium/unlimited state, and expiry timeline.

## C) Frontend service layer
- **API integration**: `/src/services/api.js`
  - Centralized fetch methods for prompts and user stats.
  - Pulls token from auth service and caches responses in storage service.
- **Auth token service**: `/src/services/auth.js`
  - Stores/retrieves token in extension sync storage.
  - Performs server logout then clears local token.
- **Cache abstraction**: `/src/services/storageService.js`
  - Keeps prompts/user stats in local storage, sync settings in sync storage.

## D) Backend API and middleware
- **Server setup**: `/server/src/index.js`
  - Express app, CORS allowlist, Helmet CSP, request logging, sessions in Mongo store.
  - Mounts routes for auth, prompts, payments, users.
- **JWT verification**: `/server/src/middleware/auth.js`
  - Extracts Bearer token and attaches decoded user payload to `req.user`.
- **Prompt CRUD + limit enforcement**: `/server/src/controllers/promptController.js`
  - CRUD logic plus subscription expiry checks and per-user prompt count/limit handling.
- **User stats endpoint**: `/server/src/controllers/userController.js`
  - Returns prompt usage, subscription metadata, active subscriptions.
- **Payment + subscription lifecycle**: `/server/src/controllers/paymentController.js`
  - Creates Razorpay orders, verifies signatures, handles webhook outcomes,
  - Manages advanced-user one-time plan and recurring unlimited subscriptions.
- **Plan model**: `/server/src/constants/plans.js`
  - Encodes free/basic, one-time extended, and unlimited periodic plans.
- **Session cleanup jobs**: `/server/src/utils/scheduledTasks.js`, `/server/src/utils/sessionUtils.js`
  - Scheduled cleanup for expired sessions in Mongo session store.

## E) Web app role
- **Landing + distribution**: `/web/src/app/page.js`
- **Proxy API routes** (token-forwarding pattern): `/web/src/app/api/**/route.js`
- **Shared API helper**: `/web/src/lib/api.js`
  - Keeps backend URL indirection and auth forwarding in one place.

---

## 7) Major engineering decisions (and why)

1. **Chrome extension as primary client**
   - Decision: build for immediate in-browser productivity.
   - Why: fastest path from discovering a prompt to using it in another tab/workflow.

2. **Two-tier storage strategy (sync + local)**
   - Decision: token/preferences in `chrome.storage.sync`, prompt cache in `chrome.storage.local`.
   - Why: sync keeps identity/config across browser profile; local keeps larger prompt reads fast.

3. **Cache-then-refresh data loading**
   - Decision: return cached prompts quickly and refresh in background when stale.
   - Why: improved perceived performance without losing backend consistency.

4. **Backend as source-of-truth for entitlement**
   - Decision: limits/subscription enforced server-side only.
   - Why: avoids client-side bypass and protects billing integrity.

5. **Dynamic OAuth callback strategy**
   - Decision: callback URL generated from request context in passport config.
   - Why: supports different environments and both extension/web auth paths.

6. **Subscription state history (`previousStatus`, `activeSubscriptions`)**
   - Decision: persist prior entitlement and multi-subscription timeline.
   - Why: enables correct rollback on expiry and cleaner renewal stacking logic.

7. **Rate limiting sensitive payment routes**
   - Decision: stricter limits for create-order/verify-payment/cancel flows.
   - Why: reduces fraud/bruteforce surface and accidental repeated actions.

---

## 8) Key challenges and how we solved them

1. **Challenge: Seamless OAuth from extension context**
   - Solution: pass extension ID + state, complete OAuth on backend callback, then `chrome.runtime.sendMessage` token back to extension.

2. **Challenge: Fast UX without stale data bugs**
   - Solution: sync-frequency based cache invalidation with force refresh controls.

3. **Challenge: Subscription expiry edge cases**
   - Solution: explicit expiry checks (`checkSubscriptionExpiry`) + state restoration using `previousStatus`.

4. **Challenge: Avoid duplicate payment processing**
   - Solution: payment dedupe checks and idempotent-ish update flow in payment success handler.

5. **Challenge: Session store growth**
   - Solution: scheduled + manual session cleanup utilities.

---

## 9) Hydra.js / Volto discussion strategy for interview

Important: In this repository snapshot, there is **no Hydra.js or Volto-specific implementation** present.

How to answer if asked:
- “This codebase is centered on React extension + Next.js web + Node/Express backend, not a Volto/Plone stack.”
- “If we were integrating with Volto/Plone, we would map prompt CRUD and auth endpoints to Hydra-compatible resources and align client data layer accordingly, but that layer is not currently in this repository.”

This keeps your answer honest, technical, and architecture-aware.

---

## 10) Interview Q&A bank (strong concise answers)

### Q1: How does authentication work end-to-end?
Google OAuth runs on backend routes, backend signs JWT, extension stores token, API calls include Bearer token, backend middleware verifies token and resolves `req.user`.

### Q2: Why cache prompts locally?
To reduce latency and improve extension responsiveness; stale cache is managed with configurable sync frequency and force-refresh actions.

### Q3: Where do you enforce usage limits?
On the backend in prompt creation flow; frontend only displays limits and friendly messages.

### Q4: How is payment security handled?
Server-side signature verification for webhook/payment callbacks, route-level rate limiting, and plan checks before entitlement changes.

### Q5: How do you support one-time and recurring plans together?
Separate plan metadata + user flags (`isAdvancedUser`, subscription object, active subscription list), then apply deterministic state transitions on payment/expiry.

### Q6: What are your key reliability safeguards?
Server-side source-of-truth checks, explicit error handling, request logging, and scheduled cleanup tasks.

### Q7: Biggest trade-off in your design?
More state complexity in backend subscription model in exchange for correctness across upgrades, expiry, and mixed plan history.

### Q8: What would you improve next?
Add stronger automated test coverage (backend flows + extension integration), improve idempotency guarantees for payment events, and tighten CSP/auth hardening where needed.

---

## 11) Risks / limitations to acknowledge proactively
- Limited automated test depth in current snapshot.
- Some sensitive flows (payments/subscriptions) carry state complexity and need stronger contract/integration testing.
- Architecture currently optimized for extension-first use; mobile/native parity is future work.

---

## 12) Final 60-second close statement
“Prompy is a practical production system where UX speed and backend correctness are balanced: extension-side caching and workflow ergonomics drive adoption, while backend-enforced auth, limits, and payment state maintain integrity. The architecture is modular enough to evolve—adding richer analytics, stronger testing, and future client surfaces without rewriting the core domain logic.”

