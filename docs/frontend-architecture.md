# Frontend architecture

AnalyticCastle uses a small feature-oriented Next.js App Router layout. Open a folder and the responsibility should be obvious.

## Folder structure

```
src/
├── app/                 # Routes and layouts only
├── components/          # Reusable UI
│   ├── ui/              # Primitives (Button, Input, Card, …)
│   └── layout/          # App shell and auth page chrome
├── features/            # Domain logic, colocated by product area
│   ├── auth/
│   ├── workspace/
│   ├── profile/
│   ├── team/
│   ├── data-sources/
│   └── schema-explorer/
├── hooks/shared/        # Hooks used by more than one feature
├── lib/                 # App infrastructure and generic helpers
│   ├── api/             # HTTP client, errors, response normalization
│   ├── auth/            # Session storage, roles, permissions
│   ├── query/           # QueryClient defaults and query keys
│   ├── utils/           # Names, validation primitives, unknown guards
│   ├── constants/       # Route path lists
│   └── env.ts           # Public env access
├── providers/           # Root React providers
├── types/               # Cross-feature entities and API envelopes
├── proxy.ts             # Next.js request proxy (session cookie gates)
└── test/                # Test render helpers
```

`src/app/globals.css` stays with the App Router. There is no separate `styles/` tree.

## Where to look

| Question           | Location                                             |
| ------------------ | ---------------------------------------------------- |
| Pages and URLs     | `src/app/`                                           |
| Reusable UI        | `src/components/ui/` and `src/components/layout/`    |
| Authentication     | `src/features/auth/`                                 |
| Workspace features | `src/features/workspace/`                            |
| Profile display    | `src/features/profile/`                              |
| Team members       | `src/features/team/`                                 |
| Data sources       | `src/features/data-sources/`                         |
| Schema explorer    | `src/features/schema-explorer/`                      |
| AI Analyst         | `src/features/ai/`                                   |
| HTTP client        | `src/lib/api/client.ts`                              |
| React Query setup  | `src/providers/query-provider.tsx`, `src/lib/query/` |
| Shared types       | `src/types/`                                         |
| Utilities          | `src/lib/utils/`                                     |
| Configuration      | `src/lib/env.ts`, `next.config.ts`, `.env.example`   |

## Routing

Routes live only in `src/app/`.

- `(auth)` — login, register, forgot/reset password, verify email
- `(app)` — signed-in home, profile, account, workspace, data sources, AI Analyst
- Backend contract and screen→endpoint map: [`docs/backend-integration.md`](./backend-integration.md)

Pages compose feature components. They do not call APIs or own form state.

`src/proxy.ts` only checks the session cookie and public/protected path lists. Client gates in `features/auth/components/auth-guards.tsx` handle verified-email and workspace selection.

## Features

A feature owns its UI, hooks, API functions, validation, and request types.

```
features/<name>/
├── components/
├── hooks/
├── api.ts
├── schemas.ts    # when the feature has forms
└── types.ts      # request DTOs used only by that feature
```

Do not put login or workspace forms in `components/`.

`profile` only displays the current user, so it has components and no API file.

## API and React Query

UI → feature hook → `features/*/api.ts` → `lib/api/client.ts`

There is one Axios instance. It attaches the bearer token, refreshes on 401 via `POST /api/v1/auth/refresh`, and converts failures to `ApiError` (including FastAPI `detail`).

TanStack Query defaults live in `lib/query/query-client.ts`. Feature hooks own queries and mutations. Shared cache keys live in `lib/query/query-keys.ts` so features can invalidate each other without importing internals.

## Authentication

- Domain: `features/auth/` (API, forms, mutations, `useCurrentUser`, post-login path)
- Session infrastructure: `lib/auth/session.ts`
- App-wide auth state: `features/auth/auth-provider.tsx`, mounted from `providers/app-provider.tsx`

`useAuth()` is the UI entry point. Import it from `features/auth/hooks/use-auth`.

## Types and validation

- `types/common.ts` — `User`, `Workspace`, `Role`, `Permission`, and other shared entities
- `types/api.ts` — `MeResponse`, `AuthResponse`, token envelope
- Feature `types.ts` — request bodies for that feature only

Validation is the existing helper functions in `lib/utils/validation.ts`, not a second library. Feature `schemas.ts` files compose those helpers into form `validate` functions.

## Dependency direction

```
app → features / providers / components
features → lib / types / components/ui
lib → types / env
```

`lib` must not import feature components. Features may use another feature’s public `api.ts` or hook (for example auth session composition loads organizations and workspaces).

## Naming

- Files: kebab-case (`login-form.tsx`, `use-current-user.ts`)
- Components: PascalCase
- Functions and variables: camelCase

Tests sit next to the file they cover.
