# Student Event Manager — Frontend

> A role-based web app for discovering, organizing, and checking in to student events — with QR-code tickets, an interactive calendar, recurring events, and an admin control panel.

<p align="left">
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="TanStack Query" src="https://img.shields.io/badge/TanStack_Query-5-FF4154?logo=reactquery&logoColor=white" />
  <img alt="Zustand" src="https://img.shields.io/badge/Zustand-5-443E38" />
  <img alt="PWA" src="https://img.shields.io/badge/PWA-enabled-5A0FC8?logo=pwa&logoColor=white" />
  <img alt="Tests" src="https://img.shields.io/badge/tests-Vitest-6E9F18?logo=vitest&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-green" />
</p>

This is the single-page-application frontend for a student event platform. It talks to a separate REST backend (the `VITE_API_URL` service) and ships as an installable Progressive Web App, optimized for the mobile check-in flow.

---

## ✨ Features

The app has three roles, each with its own dashboard and navigation. Authentication is cookie-based JWT with transparent token refresh.

### 🎓 Student

- **Browse events** with full-text search, date filtering, and sorting (by date, popularity, or attendance).
- **Event details** with capacity, location map, rich (sanitized) descriptions, and registration-window handling (presale / open / closed).
- **One-tap enrollment** and a **"My Tickets"** view split into active tickets and history.
- **QR ticket** view — each ticket renders a scannable code used for venue check-in.
- **Interactive calendar** with an animated 3D day view.

### 🎟️ Organizer

- **Create & edit events** with a location picker (OpenStreetMap / Leaflet), image upload, HTML description editor, and a **recurrence builder** (daily/weekly/monthly, by count or end date).
- **Manage events** in a sortable table and per-event detail pages.
- **Attendee list** with manual check-in.
- **Mobile QR scanner** (full-screen camera) for fast door check-in.

### 🛠️ Admin

- **Manage users** — create, edit, change roles, delete, and trigger password resets.
- **All events** across the whole platform.
- **System logs** — searchable, filterable audit trail.
- **Organizer tokens** — generate and email registration tokens for new organizers.

### 🌐 Shared / Public

- Landing page, login, student & organizer registration, forgot/reset password.
- Public user profiles (the target of a ticket's QR code).
- Editable profile with bio and social links.
- **Light / Dark / Mono** themes (persisted, anti-FOUC), animated WebGL background, and toast / confirm dialog systems.

---

## 🧰 Tech Stack

| Area               | Technology                                                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Framework          | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)                                                           |
| Build tool         | [Vite 8](https://vite.dev) (+ [vite-plugin-pwa](https://vite-pwa-org.netlify.app))                                                     |
| Styling            | [Tailwind CSS 4](https://tailwindcss.com)                                                                                              |
| Routing            | [React Router 7](https://reactrouter.com) (lazy-loaded routes)                                                                         |
| Server state       | [TanStack React Query 5](https://tanstack.com/query)                                                                                   |
| Client state       | [Zustand 5](https://zustand-demo.pmnd.rs)                                                                                              |
| Forms & validation | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)                                                                |
| Maps               | [Leaflet](https://leafletjs.com) + [react-leaflet](https://react-leaflet.js.org) (OSM Nominatim geocoding)                             |
| QR                 | [html5-qrcode](https://github.com/mebjas/html5-qrcode) (scan) + [react-qr-code](https://github.com/rosskhanas/react-qr-code) (display) |
| Graphics / motion  | [three.js](https://threejs.org) + [postprocessing](https://github.com/pmndrs/postprocessing), [GSAP](https://gsap.com)                 |
| Security           | [DOMPurify](https://github.com/cure53/DOMPurify) (HTML sanitization)                                                                   |
| Testing            | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) + [MSW](https://mswjs.io)                                |
| Tooling            | ESLint, TypeScript-ESLint                                                                                                              |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 22+** and npm
- A running instance of the backend API (defaults to `http://localhost:5064/api`)

### Installation

```bash
git clone <repo-url>
cd EventSystem-frontend
npm install
```

### Configure environment

Copy the template and point it at your backend:

```bash
cp .env.template .env
```

```env
# .env
VITE_API_URL=http://localhost:5064/api
```

> If `VITE_API_URL` is unset, the app falls back to `http://localhost:5064/api`.

### Run

```bash
npm run dev       # start the dev server at http://localhost:3000
```

---

## 📜 Available Scripts

| Script            | Description                                                      |
| ----------------- | ---------------------------------------------------------------- |
| `npm run dev`     | Start the Vite dev server (port `3000`).                         |
| `npm run build`   | Type-check (`tsc -b`) and produce a production build in `dist/`. |
| `npm run preview` | Serve the production build locally.                              |
| `npm run lint`    | Run ESLint over the project.                                     |
| `npm test`        | Run the Vitest test suite.                                       |

---

## 🗂️ Project Structure

```
EventSystem-frontend/
├── public/                  # Static assets (favicon, icons, PWA service worker output)
├── index.html               # App shell + anti-FOUC theme script + web fonts
├── src/
│   ├── main.tsx             # Entry point; hydrates auth/theme stores, mounts <App>
│   ├── App.tsx              # QueryClientProvider + router
│   │
│   ├── routes/              # Router config + role-based ProtectedRoute guard
│   ├── layouts/             # Route shells (Root, Auth, Dashboard, MobileScanner)
│   │
│   ├── features/            # Feature modules grouped by domain/role
│   │   ├── auth/            #   Login, registration, forgot/reset password
│   │   ├── public/          #   Home, Unauthorized
│   │   ├── student/         #   Dashboard, event browser, tickets, QR view
│   │   ├── organizer/       #   Dashboard, event CRUD, attendees, QR scanner
│   │   ├── admin/           #   Users, all events, logs, organizer tokens
│   │   ├── shared/          #   Profile, public profile, calendar (cross-role)
│   │   └── */api/           #   React Query hooks per feature (queries & mutations)
│   │
│   ├── components/ui/        # Reusable presentational components
│   │                         #   (PixelBlast bg, LocationPicker, RecurrencePicker,
│   │                         #    ToastContainer, ConfirmDialog, PageHeader, …)
│   ├── store/               # Zustand stores (auth, theme, toast, confirm)
│   ├── lib/                 # Framework-agnostic helpers + the fetch/API client
│   │                         #   (apiClient, queryClient, eventDate, eventSort,
│   │                         #    eventPopularity, eventRegistration, recurrence, useNow)
│   └── styles/              # Global CSS / Tailwind entry + design tokens
│
├── Dockerfile               # Multi-stage build → nginx static serving
├── nginx.conf               # SPA fallback + PWA-aware caching headers
├── vite.config.ts           # Vite + Tailwind + PWA config, `@` → `src` alias
└── .env.template            # Environment variable template
```

### How the pieces fit together

- **State** is split: [TanStack Query](src/lib/queryClient.ts) owns _server_ state (events, tickets, users), while [Zustand stores](src/store/) own _client_ state (the logged-in user, theme, toasts, confirm dialogs).
- **API access** goes through [`apiClient`](src/lib/apiClient.ts), a `fetch` wrapper that sends cookies (`credentials: "include"`), and on a `401` transparently calls `POST /auth/refresh`, queueing concurrent requests until the token is renewed — failing that, it logs out and redirects to `/login`.
- **Routes** are lazy-loaded and wrapped in [`ProtectedRoute`](src/routes/ProtectedRoute.tsx), which enforces role access (`Student` / `Organizer` / `Admin`).
- **Recurrence** is expanded client-side in [`lib/recurrence.ts`](src/lib/recurrence.ts) (creating a series of events on save), capped at a safe maximum number of occurrences.

---

## 🌍 Deployment

The repo ships a production-ready Docker image: a multi-stage build that compiles the app and serves the static output with nginx (SPA history fallback + cache headers tuned for the PWA service worker).

```bash
# Bake the API URL into the build at image-build time
docker build --build-arg VITE_API_URL=https://api.example.com/api -t event-frontend .
docker run -p 8080:80 event-frontend
```

> `VITE_API_URL` is read at **build time** (Vite inlines env vars), so it must be passed as a build arg — not a runtime env var.

---

## 🔌 Backend

This is the frontend only. It expects a REST API exposing auth, users, events, tickets, and admin endpoints under `VITE_API_URL`. Endpoints follow a `{ data: ... }` response envelope (unwrapped by [`apiFetch`](src/lib/apiClient.ts)). Auth is handled via HTTP-only JWT cookies with a refresh endpoint.

---

## 📄 License

[MIT](LICENSE) 2026 © Krzysztof Wiłnicki
