# Frontend Deployment Audit & Migration Plan (Vercel)

> **Repository**: `better-dev-ui`  
> **Target Platform**: [Vercel](https://vercel.com)  
> **Canonical Production Frontend Domain**: `https://www.betterdev.in` (Redirect: `https://betterdev.in` → `https://www.betterdev.in`)  
> **Canonical Production Backend API Domain**: `https://api.betterdev.in`  
> **Role in Application**: Client-side Single Page Application (SPA) for the Better Dev AI platform.

---

## 1. Executive Summary & Deployment Audit

### 1.1 Current Deployment State (Forensic Investigation)
* **Status**: **CONFIRMED LIVE on Vercel** (verified via response headers `server: Vercel`, `x-vercel-cache: HIT`, and edge node routing).
* **Current Domains**:
  * `www.betterdev.in` → CNAME record resolving to `cde398619b4cd604.vercel-dns-017.com` (200 OK).
  * `betterdev.in` → A record pointing to Vercel edge IP `216.198.79.1` (307 redirect to `https://www.betterdev.in/`).
* **Current Limitation**: While the frontend bundle is actively served by Vercel, the application is currently non-operational for end users because the backend API (`https://api.betterdev.in`) was hosted on a deleted DigitalOcean droplet and is offline.

### 1.2 Frontend Architecture & Build System
* **Framework**: React 19.1.1 (Client-side rendered Single Page Application).
* **Build Tool**: Vite 7.1.7 with TypeScript 5.9.3.
* **Styling**: TailwindCSS v4 (`@tailwindcss/vite` plugin).
* **Routing**: `react-router-dom` v7.9.4 (`BrowserRouter` with routes `/login`, `/register`, `/new`, `/chat/:conversationId`, and `/` redirecting to `/new`).
* **State Management & Data Fetching**: `@tanstack/react-query` v5.90.3, `axios` v1.12.2.
* **AI Streaming Integration**: AI SDK v5 (`@ai-sdk/react`, `ai`) consuming Server-Sent Events (SSE) via `DefaultChatTransport`.
* **Output Directory**: `dist/`
* **Build Command**: `tsc -b && vite build` (or `npm run build`).

### 1.3 Audit Findings & Identified Risks
1. **Fragile Vercel Install Command in `vercel.json`**:
   The current `vercel.json` contains:
   `"installCommand": "rm -rf node_modules package-lock.json && npm install --legacy-peer-deps"`
   *Risk*: Deleting `package-lock.json` on every build removes deterministic dependency resolution, increases build duration, and can introduce unexpected upstream breakage.
2. **Missing Production `.env.example` Alignment**:
   `.env.example` contains placeholder comments referencing hypothetical backend domains without documenting production environment variable expectations.
3. **Obsolete DigitalOcean Documentation**:
   `README.md` references historical DigitalOcean server deployment patterns that are obsolete for the frontend SPA.

---

## 2. Target Architecture Specification

```
┌────────────────────────────────────────────────────────┐
│               CUSTOM DOMAINS & ROUTING                 │
│                                                        │
│  betterdev.in (Apex A-Record: 216.198.79.1)            │
│         │ (HTTP 307 Permanent Redirect)                │
│         ▼                                              │
│  https://www.betterdev.in (Canonical Frontend)         │
│         │                                              │
│         ▼                                              │
│  Vercel Edge Network (Global CDN / SSL auto-renew)     │
│         │                                              │
│         ├─ Static Assets (/dist)                       │
│         └─ SPA Fallback (/index.html rewrite)          │
│                                                        │
│  Client API Requests (Axios + AI SDK SSE)              │
│         │                                              │
│         ▼                                              │
│  https://api.betterdev.in (Render Backend)             │
└────────────────────────────────────────────────────────┘
```

### 2.1 Domain & SSL Specifications
* **Canonical URL**: `https://www.betterdev.in`
* **Redirect URL**: `https://betterdev.in` → `https://www.betterdev.in`
* **SSL Certificate**: Managed automatically by Vercel (Let's Encrypt / ZeroSSL).
* **Routing Strategy**: Single Page Application rewrite rule: `/(.*)` → `/index.html`.

### 2.2 Environment Variables

| Variable Name | Environment | Purpose | Example / Required Value |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Production (Vercel) | Canonical Backend API Root URL | `https://api.betterdev.in` |
| `VITE_API_BASE_URL` | Preview / Staging | Test / Staging Backend URL | `https://api.betterdev.in` (or staging backend) |
| `VITE_API_BASE_URL` | Development (Local) | Local Backend Server URL | `http://localhost:3001` |
| `VITE_CLIENT_PORT` | Development (Local) | Local Vite dev server port | `3000` |

*Note: All frontend environment variables MUST start with `VITE_` to be embedded at build time by Vite.*

---

## 3. Cross-Repository Dependencies

The frontend repository interacts with the backend repository (`better-dev-api`) under the following contracts:

1. **API Domain & Protocol**:
   * Frontend will dispatch all REST and SSE calls to `https://api.betterdev.in`.
2. **CORS & Credentials**:
   * Backend must allow `Origin: https://www.betterdev.in` and `Origin: https://betterdev.in`.
   * Requests use `credentials: 'include'` (for SSE) and `Authorization: Bearer <token>` (for Axios).
3. **Core Endpoints Consumed**:
   * `POST /auth/register` — User signup.
   * `POST /auth/login` — User authentication returning JWT token.
   * `GET /auth/profile` — User validation.
   * `GET /chat/conversations` — Conversation list.
   * `POST /chat/conversations/with-message` — Create new conversation with first prompt.
   * `GET /chat/conversations/:id` — Conversation history.
   * `DELETE /chat/conversations/:id` — Delete conversation.
   * `POST /chat/conversations/:id/messages` — Real-time AI response stream (Server-Sent Events).
   * `POST /chat/conversations/:id/generate-title` — Auto-generate conversation title (`src/lib/conversations.ts`).
   * `PUT /chat/conversations/:id/system-prompt` — Update conversation system prompt (`src/lib/conversations.ts`).
   * `POST /attachments/upload` — Multipart form-data file upload.
4. **Sequencing Dependency**:
   * The backend deployment on Render (`api.betterdev.in`) must be healthy and reachable before the frontend production user journeys can succeed.

---

## 4. Step-by-Step Implementation Plan

### Task 1: Clean Up and Stabilize `vercel.json`
* **Type**: `Agent Implementation`
* **File**: [`vercel.json`](file:///Users/kashifrezwi/Developer/betterdev/better-dev-ui/vercel.json)
* **Objective**: Remove destructive lockfile removal commands while preserving peer dependency resolution and SPA routing.
* **Modification**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install --legacy-peer-deps",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
* **Validation**: Run `npm run build` locally to verify clean compile without errors.

---

### Task 2: Update `.env.example`
* **Type**: `Agent Implementation`
* **File**: [`.env.example`](file:///Users/kashifrezwi/Developer/betterdev/better-dev-ui/.env.example)
* **Objective**: Document exact local and production environment variable requirements.
* **Content**:
```env
# ============================================
# VITE DEVELOPMENT SERVER
# ============================================
VITE_CLIENT_PORT=3000

# ============================================
# BACKEND API CONFIGURATION
# ============================================
# Local development:
VITE_API_BASE_URL=http://localhost:3001

# Production (Configure in Vercel Dashboard):
# VITE_API_BASE_URL=https://api.betterdev.in
```

---

### Task 3: Update Repository Documentation (`README.md`)
* **Type**: `Agent Implementation`
* **File**: [`README.md`](file:///Users/kashifrezwi/Developer/betterdev/better-dev-ui/README.md)
* **Objective**: Deprecate historical DigitalOcean references, establish Vercel as the authoritative deployment target, and document production domain setup.
* **Validation**: Ensure all links, environment instructions, and build steps match the Vercel architecture.

---

### Task 4: Verify Vercel Project Dashboard Configuration
* **Type**: `Manual User / Provider Action`
* **Console**: [Vercel Dashboard](https://vercel.com)
* **Instructions**:
  1. Open project `better-dev-ui` in Vercel.
  2. Navigate to **Settings** → **Environment Variables**:
     * Key: `VITE_API_BASE_URL`
     * Value: `https://api.betterdev.in`
     * Environments: Select **Production**, **Preview**, and **Development**.
  3. Navigate to **Settings** → **Domains**:
     * Ensure `www.betterdev.in` is configured as the **Canonical Domain**.
     * Ensure `betterdev.in` is configured to **Redirect to `www.betterdev.in`**.
     * Status should show valid green checkmarks for DNS and SSL.
  4. Navigate to **Settings** → **Git**:
     * Production Branch: `main`.

---

### Task 5: Trigger Vercel Production Redeployment
* **Type**: `Manual User / Provider Action` or Git Push
* **Instructions**:
  * Push the updated `vercel.json` and documentation changes to branch `main`.
  * Alternatively, trigger a manual redeployment via Vercel Dashboard (**Deployments** → **Redeploy** without cache).

---

## 5. Verification & Validation Checklist

Execute this checklist once both Frontend (Vercel) and Backend (Render) are live:

- [ ] **Local Build**: Run `npm run build` in `better-dev-ui` — passes with 0 type/build errors.
- [ ] **Vercel Build**: Deployment completes on Vercel with green status.
- [ ] **Apex Domain Redirect**: Visiting `http://betterdev.in` or `https://betterdev.in` automatically redirects (307/308) to `https://www.betterdev.in/`.
- [ ] **Canonical HTTPS**: Visiting `https://www.betterdev.in` serves valid SSL certificate with no browser warnings.
- [ ] **SPA Direct Deep-linking**: Refreshing the browser on a deep route (e.g. `https://www.betterdev.in/login` or `https://www.betterdev.in/new`) correctly renders the page without 404.
- [ ] **Auth Flow**: Registering or logging in from `https://www.betterdev.in/login` succeeds and stores JWT in `localStorage`.
- [ ] **Chat & AI Streaming**: Sending a prompt in `/new` connects to `https://api.betterdev.in/chat/conversations/:id/messages` and streams text tokens in real time via SSE.
- [ ] **File Uploads**: Uploading an image/document via the UI dispatches to `https://api.betterdev.in/attachments/upload` and renders preview correctly.
- [ ] **CORS Verification**: DevTools network tab shows `Access-Control-Allow-Origin: https://www.betterdev.in` on all API responses.

---

## 6. Rollback Strategy

1. **Vercel Instant Rollback**:
   * If a frontend deployment introduces an issue, navigate to Vercel Dashboard → **Deployments**.
   * Locate the previously working deployment, click `...` → **Promote to Production**. Rollback takes < 5 seconds.
2. **Environment Variable Rollback**:
   * If `VITE_API_BASE_URL` is misconfigured, update the variable in Vercel Settings and trigger a redeploy.
