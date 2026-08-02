# Frontend authentication

## Overview

Auth is centralized in `AuthContext`. All authenticated client requests go through `authenticatedFetch` (or the `apiFetch` JSON helper). Next.js middleware and server components verify the access JWT locally with `JWT_SECRET`.

## Token storage

| Token         | Where                                        | Purpose                                         |
| ------------- | -------------------------------------------- | ----------------------------------------------- |
| Access token  | In-memory (`AuthContext` + `authTokenStore`) | `Authorization: Bearer` on API calls            |
| Access token  | Non-httpOnly `accessToken` cookie            | Middleware routing + SSR user resolution        |
| Refresh token | httpOnly cookie (backend only)               | Silent session restore via `POST /auth/refresh` |

Legacy `localStorage.accessToken` is cleared on mount; do not write access tokens to storage.

## Request flow

```
Login page → AuthContext.login(user, token) → memory + cookie + token store
Mount      → POST /auth/refresh → GET /auth/me → user state
API calls  → apiFetch / authenticatedFetch → Bearer + 401 refresh retry
Logout     → AuthContext.logout() only (POST /auth/logout + clear state)
Middleware → verifyAccessToken (jose, JWT_SECRET)
SSR user   → getServerUser() reads cookie + verifyAccessToken
```

## Key modules

- `contexts/AuthContext.tsx` — session state, login/logout, refresh scheduling
- `lib/authTokenStore.ts` — sync token bridge for non-React code
- `lib/authenticatedFetch.ts` — Bearer header, credentials, 401 → refresh → retry
- `lib/authClient.ts` — `apiFetch()` JSON helper
- `lib/authUser.ts` — shared user types and API mappers
- `lib/verifyAccessToken.ts` — Edge-safe JWT verify (middleware + SSR)
- `middleware.ts` — role-based route protection

## Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:5000   # client + server API base
BACKEND_URL=http://localhost:5000           # server-only fetches (if used)
JWT_SECRET=...                              # must match Express JWT_SECRET
```

## Conventions

- Use `useAuth()` / `fetchWithAuth` in React components.
- Use `apiFetch("/path")` for authenticated JSON endpoints in client code.
- Use `authenticatedFetch(joinApiUrl(base, path), { body: formData })` for multipart uploads.
- Use `AuthContext.logout()` for sign-out; do not call `/auth/logout` directly.
- Public auth endpoints (`/auth/register`, `/auth/login`) use plain `fetch` with `credentials: "include"`.
