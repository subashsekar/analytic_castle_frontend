# Backend API integration

This frontend talks only to the AnalyticCastle FastAPI application. MCP tools stay in-process on the backend and are never called from the browser.

## Contract source

- Live docs: `http://127.0.0.1:8000/docs` (when AnalyticCastle is running)
- Live OpenAPI: `http://127.0.0.1:8000/openapi.json`
- Checked-in snapshot generated from the backend app: [`analyticcastle-openapi.json`](./analyticcastle-openapi.json)

If `/openapi.json` shows a different product title, the wrong process is bound to the port. Point `NEXT_PUBLIC_API_BASE_URL` at AnalyticCastle.

## Environment

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

`NEXT_PUBLIC_API_URL` is still accepted as a compatibility alias.

## Client architecture

| Concern | Module |
| --- | --- |
| Base URL | `src/lib/env.ts` |
| Axios client + Bearer + refresh-on-401 + `X-Request-ID` | `src/lib/api/client.ts` |
| Path constants | `src/lib/api/paths.ts` |
| Error normalization | `src/lib/api/errors.ts` |
| Health probes | `src/lib/api/health.ts` |
| Session tokens | `src/lib/auth/session.ts` (access/refresh in `localStorage` for SPA continuity; `ac_session` cookie is a presence gate for middleware only — not httpOnly JWTs) |

Auth flow:

1. `POST /api/v1/auth/login` → store `access_token` + `refresh_token`
2. Authenticated calls send `Authorization: Bearer <access_token>`
3. On `401`, client posts `POST /api/v1/auth/refresh` once, updates tokens, retries
4. Failed refresh clears the session
5. Logout posts `POST /api/v1/auth/logout` with `refresh_token`

Roles are loaded from `GET /api/v1/auth/me` (and workspace membership), not trusted from JWT claims in the UI.

## AI multi-turn contract

- Send `conversation_id` + latest `conversation_version` on each `POST /api/v1/ai/chat`
- Apply `conversation_version` from the chat response immediately, then `GET` the conversation for `agent_version`
- Planning success leaves the session **ACTIVE** — do not PATCH `COMPLETED` unless the user ends the conversation
- End conversation: `PATCH` with `{ status: "COMPLETED", expected_agent_version }` using **`agent_version`** (not `conversation_version`)
- On 409 / version-conflict 400: refetch conversation + messages, then retry
- Append messages API (if used): `role: "user"` only; assistant turns come from `/ai/chat`

## Backend CORS (AnalyticCastle `.env`)

```bash
FRONTEND_URL=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CORS_ALLOW_CREDENTIALS=true
```

If `http://127.0.0.1:8000/openapi.json` title is not **AnalyticCastle**, another process owns the port — stop it and start this backend.

## Screen → endpoint map

### Auth
| Screen | Endpoints |
| --- | --- |
| Register | `POST /api/v1/auth/register` |
| Login | `POST /api/v1/auth/login`, then `GET /api/v1/auth/me` (+ org/workspace lists) |
| Verify email | `POST /api/v1/auth/verify-email` |
| Resend verification | `POST /api/v1/auth/resend-verification` (alias `POST /api/v1/auth/verify-email/send`) |
| Forgot / reset password | `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password` |
| Change password | `POST /api/v1/auth/change-password` |

### Organization + workspace
| Screen | Endpoints |
| --- | --- |
| Organizations | `GET/POST/PATCH/DELETE /api/v1/organizations` |
| Workspace select / create / settings | `GET/POST/PATCH/DELETE /api/v1/workspaces` |
| Team members | `GET/POST/PATCH/DELETE /api/v1/workspaces/{id}/members` |

### Data sources
| Screen | Endpoints |
| --- | --- |
| List | `GET /api/v1/data-sources?workspace_id=…` |
| Create | `POST /api/v1/data-sources` |
| Details / rename / delete | `GET/PATCH/DELETE /api/v1/data-sources/{id}` |
| Test connection | `POST /api/v1/data-sources/{id}/test-connection` |

### Metadata explorer
| Screen action | Endpoints |
| --- | --- |
| Sync + poll | `POST …/metadata/sync`, `GET …/metadata/sync-status` |
| Browse | `GET …/schemas`, `…/tables`, `…/columns`, `…/relationships` |
| Search | `GET …/metadata/search?q=…` |
| Sample rows | `POST …/tables/{table_id}/sample` |

### AI Analyst (`/ai`)
| Action | Endpoint |
| --- | --- |
| Send message | `POST /api/v1/ai/chat` with `{ message, data_source_id, conversation_id?, conversation_version? }` |
| List conversations | `GET /api/v1/workspaces/{workspace_id}/conversations` |
| Create conversation | `POST /api/v1/workspaces/{workspace_id}/conversations` |
| Get conversation | `GET /api/v1/workspaces/{workspace_id}/conversations/{id}` |
| End conversation | `PATCH /api/v1/workspaces/{workspace_id}/conversations/{id}` with `{ status: "COMPLETED", expected_agent_version }` (`agent_version` from conversation GET/list) |
| List messages | `GET /api/v1/workspaces/{workspace_id}/conversations/{id}/messages` |
| Append user message | `POST …/messages` with `{ content, expected_context_version, role: "user", trim_if_needed? }` — assistant messages come from `/ai/chat` only |

Response fields used in UI: `response`, clarification flags (as follow-up chips), plan capabilities (product labels), resolved catalog tables/columns, `conversation_id` / `conversation_version`, and conversation `agent_version` for end/complete. Token usage is accepted from the API but not shown as a primary control. No streaming transport is exposed by the Phase 6 API yet — the UI shows an “Analyzing…” status while the request is in flight. No SQL editor and no MCP browser client.

### Phase 8 — Insights & Analysis (gated)

Phase 8 **agents exist in the backend** (`app/ai/data_analyst`, `trend_analysis`, `anomaly_detection`, `root_cause_analysis`, `insight`, `recommendation`, `evaluation`) but **production `POST /api/v1/ai/chat` does not yet attach their outputs**. The OpenAPI snapshot’s `AIChatResponse` still ends at intent / plan / metadata_context.

Frontend behavior:

- Types + parsers accept an optional nested `analysis` object on the chat response (see `src/features/ai/types.ts` → `Phase8Analysis`).
- Rendering is **feature-gated**: if `analysis` is absent, chat works as Phase 6/7.
- If `intent` / `plan` requires clarification, the analysis panel is **not** shown as finished.
- Fixtures for tests: `src/features/ai/components/analysis/phase8-fixtures.ts` (shapes from `tests/test_phase8_integration.py`).

**Backend fields still missing from HTTP (as of this note):**

| Expected on chat (or a documented analysis endpoint) | Status |
| --- | --- |
| `analysis.session_id` | Not on public `AIChatResponse` |
| `analysis.data_analyst` (`DataAnalysisResult`) | Internal agent only |
| `analysis.trend` (`TrendAnalysisResult`) | Internal agent only |
| `analysis.anomaly` (`AnomalyAnalysisResult`) | Internal agent only |
| `analysis.root_cause` (`RootCauseAnalysisResult`) | Internal agent only |
| `analysis.insight` (`InsightAnalysisResult`) | Internal agent only |
| `analysis.recommendation` (`RecommendationResult`) | Internal agent only |
| `analysis.evaluation` (`EvaluationReport`) | Internal `evaluate_agents` only |
| SQL generation / execution results as first-class chat fields | Phase 7 paths / nested workspace AI may exist locally; not in checked-in OpenAPI chat schema |

Until the backend wires these onto chat (or documents a separate analysis endpoint), the UI will not invent agent data.

### Health
| Probe | Endpoint |
| --- | --- |
| Root | `GET /` |
| Liveness | `GET /health/live` |
| Readiness | `GET /health/ready`, `GET /health` |

## Security notes

- Never log access/refresh tokens, passwords, or data-source credentials
- Sample preview has no unmask controls
- Frontend RBAC is UX-only; FastAPI remains the security boundary
- Do not invent `/mcp` HTTP routes

## Local verification

1. Backend `/docs` title is **AnalyticCastle**
2. Frontend `.env.local` points at that API
3. Frontend origin is `http://localhost:3000` or `http://127.0.0.1:3000`
4. Register → verify → login → create org/workspace → add PostgreSQL source → test → sync metadata → browse → AI chat
