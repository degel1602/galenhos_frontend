# AGENTS.md

Angular 22 standalone SPA (hospital admin system, "Galenos"). UI text, component/file naming, and code comments are in Spanish; Angular symbols (interfaces, DI, signals) use standard conventions. There is no NgModule anywhere — everything is standalone + `bootstrapApplication`.

## Commands

- Dev server: `npm start` (`ng serve`, port 4200)
- Production build: `npm run build`
- Tests: `npm test` (`ng test` via `@angular/build:unit-test` = Vitest, globals in `tsconfig.spec.json`; jsdom). No spec files exist yet — create `*.spec.ts` beside components.
- There are **no** lint/typecheck npm scripts. Use `npx biome check .` for linting and `npx tsc -b` for a typecheck of the project references in `tsconfig.json` (`app` + `spec`).

## Formatting — two tools with conflicting rules

Both Biome and Prettier are configured, and they disagree. Existing code follows **Prettier/.editorconfig**: 2-space indent, single quotes, printWidth 100 (`npx prettier --write`). Biome enforces tabs + double quotes and auto organize-imports. Match existing file style (single quotes, 2-space) when editing; use Prettier on `.html` via its `angular` parser. Do not blindly run `biome format` — it will reformat the whole tree to tabs/double quotes.

## All HTTP goes through ApiClientService (native `fetch`)

There is no Angular HttpClient / `provideHttpClient`. `src/app/compartido/api-client/api-client.service.ts` wraps native `fetch`.

- Base URL: `http://<current hostname>:8080`, overridable via `localStorage['galenos.apiBaseUrl']` (set by the Configuración page; trailing `/` stripped).
- Every backend call returns an envelope `{ success, data?, error? }`; success is unwrapped, failures throw `ApiRequestError(code, message, status)`.
- Auth: Bearer token from `localStorage['galenos.accessToken']`; `Http 401` with `requiresAuth` triggers `AuthService.logout()`. Menu/permission data also lives in `localStorage` (`galenos.menus`, `galenos.permisos`).
- No request proxy in `angular.json`; the dev server calls the backend directly.

## Source layout (hexagonal-ish, Spanish names)

- `src/app/modulos/<modulo>/adaptadores/entrada/ui/paginas|componentes/*` — UI pages/components per module
- `src/app/modulos/<modulo>/adaptadores/salida/http/*.api.service.ts` — backend API services (thin, call `ApiClientService`)
- `src/app/modulos/<modulo>/aplicacion/*` — cross-cutting services/guards (e.g. `auth.guard.ts`)
- `src/app/compartido/<ui|api-client|tipos|utilidades>` — shared components, envelope types, validators, print/mappers
- Exception: `evolucion-medica` uses its own shape (`servicios/`, `componentes/`, nested `formulario-soap/`) instead of `adaptadores/`.

Bootstrap: `src/main.ts` → `configuracion-global.ts` (`ApplicationConfig`, only `provideZoneChangeDetection` + `provideRouter`). Routes live in `src/app/rutas/rutas-principales.ts` (note the Spanish filename); register new pages there — most are eager `component`, `sis` and `hospitalizacion` use `loadComponent`. Root component: `src/app/raiz/componente-raiz.ts`.

## Styling

Tailwind 4 (`@import 'tailwindcss'` in `src/styles.css`), no config file. Custom `gp-*` animations/utilities live in `src/styles.css`.

## Git workflow

Per-developer/feature branches (`Nicolas_dev`, `feature/*`) merged into `main` via PRs (friend rebase during merge). Commit messages mix `conventional-commits` `feat:`/`fix:` with free-form Spanish. No CI or pre-commit hooks in the repo.