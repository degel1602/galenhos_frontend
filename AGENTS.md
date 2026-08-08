# AGENTS.md

GALENOS PRO Frontend — React + TypeScript + Vite + Tailwind CSS SPA that consumes the Go REST API in [`galenos_backend`](../galenos_backend).

## Stack

- React 18, TypeScript (strict), Vite 5, Tailwind CSS 3
- No router/state library — navigation via `useState` + React context (`AuthContext`)
- No test, lint, or CI infrastructure yet

## Commands

```bash
npm install
npm run dev      # dev server on http://localhost:5173
npm run build    # tsc && vite build (TypeScript check first, then bundle)
npm run preview  # preview the production build
```

`npm run build` is the only verification step — there is no `test`, `lint`, or `typecheck` script.

## Setup

1. Copy `.env.example` → `.env` (gitignored). The only variable is `VITE_API_BASE_URL` (default `http://localhost:8080`).
2. The `galenos_backend` API must be running for real login; the backend repo has its own `AGENTS.md` and `README.md`.
3. Start the dev server: `npm run dev`.

## Auth & API

- JWT stored in `localStorage` under `galenos.accessToken`; username under `galenos.username`.
- All requests (except login) send `Authorization: Bearer <token>`.
- On `401`, the client clears the session and dispatches `window` event `galenos:auth-expired`, triggering automatic logout.
- **Demo login** is available in DEV mode only (`import.meta.env.DEV`) — visible as a button on the Login screen. Uses a fake token; no backend needed.
- The API base URL can be overridden at runtime from the **Configuración** screen; it persists in `localStorage` and takes priority over `VITE_API_BASE_URL`.
- API responses follow the envelope pattern `{ success, data?, error? }`. See `src/api/client.ts` and `src/api/types.ts`.

## Architecture

```
src/
  api/          HTTP client (fetch), JWT helpers, types
  context/      AuthContext (session, login/logout, 401 handling)
  components/   AppShell, Sidebar, Topbar, Badge, Logo, Modal
  screens/      Login, Dashboard, Pacientes, Citas, Triaje, Admisiones, Configuracion
  data/         navigation.ts (Screen type + titles)
```

No external router — `AppShell` renders the active screen via a `switch` on the `Screen` union type.

## Key Conventions

- TypeScript strict: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`.
- Tailwind custom palette: `navy`, `blue`, `sky` in `tailwind.config.js`; font is Poppins (loaded from Google Fonts in `index.html`).
- All UI strings are in Spanish.
- The `AUTH_EXPIRED_EVENT` (`galenos:auth-expired`) decouples 401 handling from the HTTP client — the client dispatches the event; `AuthContext` listens and resets state.

## Sibling Backend

The Go backend (`../galenos_backend`) uses hexagonal architecture. Its `AGENTS.md` documents the API contract, port conventions, and SQL Server locking patterns. The frontend API types in `src/api/types.ts` mirror the backend DTOs.