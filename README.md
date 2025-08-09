# CIS React Integration Demo

A React application for testing and demonstrating Content Interaction Service (CIS) integration.

## Prerequisites

- Node.js 20+ (recommended)
- npm 10+ (comes with Node)
- A running CIS API (your current base URL is `http://54.198.209.187`)

## 1) Clone the repository

```bash
git clone <your-repo-url>
cd cis-testing-app
```

## 2) Install dependencies

```bash
npm install
```

## 3) Configure the CIS API

The app reads its API configuration from `src/config/cis.ts`.

- Base URL: `CIS_CONFIG.BASE_URL`
- Auth token: `CIS_CONFIG.AUTH_TOKEN`

Current values:

```ts
// src/config/cis.ts
export const CIS_CONFIG = {
  BASE_URL: "http://54.198.209.187",
  ENDPOINTS: {
    SINGLE_INTERACTION: "/cis/interactions",
    BATCH_INTERACTIONS: "/cis/interactions/batch",
    USER_ANALYTICS: "/cis/interactions/me",
    CONTENT_ANALYTICS: "/cis/interactions/content",
  },
  AUTH_TOKEN: "test-token",
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  BATCH_SIZE: 10,
  HEARTBEAT_INTERVAL: 30000,
  DWELL_TIME_UPDATE_INTERVAL: 5000,
};
```

Update `BASE_URL` and `AUTH_TOKEN` if needed.

## 4) Run the development server

```bash
npm run dev
```

- Open the app at `http://localhost:5173`.

## 5) What’s included in the UI

- CIS Integration Test (`CisTest`)
  - Test Connection: quick GET to verify connectivity
  - Test Interaction: sends a sample `POST /cis/interactions`
- Interactive Content Cards (`ContentCards`)
  - Demonstrates dwell tracking and common interactions
- Interaction Tester (`InteractionTester`)
  - Fire any interaction type on demand for validation

## 6) Build for production

```bash
npm run build
```

## 7) Preview the production build

```bash
npm run preview
```
