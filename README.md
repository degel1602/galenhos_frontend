# GALENOS PRO — Frontend

Frontend en React + TypeScript + Vite + Tailwind para el sistema hospitalario **GALENOS PRO**, consumiendo la REST API en Go de [`galenos_backend`](../galenos_backend).

Reutiliza la identidad visual (paleta navy/blue/sky, tipografía Poppins, layout de sidebar + topbar) del proyecto SEIDOR SSA, adaptada a la marca y al dominio de citas médicas.

## Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3 (paleta `navy`, `blue`, `sky` definida en `tailwind.config.js`)
- Sin librerías de routing/estado: navegación por `useState` y contexto de React (`AuthContext`), igual que el proyecto de referencia.

## Requisitos

- Node.js 18+
- La API de `galenos_backend` corriendo (ver su propio README) con `JWT_SECRET`, `API_USERNAME` y `API_PASSWORD` configurados.

## Configuración

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

| Variable | Descripción | Default |
|---|---|---|
| `VITE_API_BASE_URL` | URL base de la API Go | `http://localhost:8080` |

La URL también puede cambiarse en caliente desde la pantalla **Configuración** de la app (se guarda en `localStorage` y tiene prioridad sobre la variable de entorno).

## Cómo correr

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. Inicia sesión con las credenciales configuradas en el backend (`API_USERNAME` / `API_PASSWORD`).

## Build de producción

```bash
npm run build
npm run preview
```

## Estructura

```
src/
  api/          cliente HTTP (fetch + manejo de JWT) y tipos del contrato con el backend
  context/      AuthContext: sesión, login/logout, token en localStorage
  components/   AppShell, Sidebar, Topbar, Badge, Logo (design system)
  screens/      Login, Dashboard, Pacientes, Citas, Configuración
  data/         navigation.ts (pantallas y títulos)
```

## Pantallas

| Pantalla | Qué hace | Endpoint(s) |
|---|---|---|
| Login | Autentica y guarda el JWT | `POST /api/v1/auth/login` |
| Dashboard | Resumen y accesos rápidos | `GET /api/v1/pacientes?page=1&pageSize=1` |
| Pacientes | Búsqueda por documento + listado paginado | `GET /api/v1/pacientes/:numDocumento`, `GET /api/v1/pacientes` |
| Citas Médicas | Agendar cita y buscar cita por id | `POST /api/v1/appointments`, `GET /api/v1/appointments/:id` |
| Configuración | URL de la API y cierre de sesión | — |

Todas las peticiones (salvo login) envían `Authorization: Bearer <token>`. Si el backend responde `401`, la sesión se cierra automáticamente y se vuelve a la pantalla de Login.
