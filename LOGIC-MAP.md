# LOGIC-MAP

## Logic chain for the implementation updates

### 1) Replace simulated registry sync with deterministic, live metadata retrieval
- **Why now:** Simulated sync states and randomized delays undermine trust; a registry UI must reflect real repository health.
- **Implementation logic chain:**
  1. If a repository URL is GitHub, then the GitHub REST API provides authoritative `pushed_at`, `updated_at`, and `stargazers_count`.
  2. If a repository is not GitHub, then a HEAD request can still supply `Last-Modified`/`Date` headers that indicate recency.
  3. If these timestamps are stored per agent, then current sync status can be evaluated without re-fetching on every render.
  4. Therefore, the status pipeline is deterministic, uses real data, and avoids mock signals.
- **Proof sketch:**
  - Let `S` be `lastSynced` and `P` be `repoLastPushed`. If `P > S`, then the repo changed after the last sync → `UPDATE_AVAILABLE`.
  - Let `E` be `lastSyncErrorAt` and `now - E < OFFLINE_GRACE`. Then recent failure implies a likely outage → `OFFLINE`.
  - Otherwise, the agent is reachable and up-to-date → `LIVE`.

### 2) Persist live metadata in the agent state (stars, timestamps, error states)
- **Why it matters:** Without persistent metadata, status checks would oscillate or require full re-fetch.
- **Implementation logic chain:**
  1. If `syncAgent` returns canonical metadata (stars and timestamps), then updates can be merged into the existing agent model.
  2. If the metadata is stored, then periodic checks can be computed in O(n) without network calls.
  3. Therefore, the UI presents stable, explainable state and avoids noisy updates.
- **Proof sketch:**
  - Update is a pure function over `(agent, metadata)` with deterministic field precedence (`metadata ?? existing`).
  - This guarantees idempotence: applying the same metadata yields the same state.

### 3) Release readiness path for metadata dependencies
- **Why it matters:** Production release needs explicit requirements for environment keys and external APIs.
- **Implementation logic chain:**
  1. If Gemini requires `GEMINI_API_KEY`, then build/deploy must inject it.
  2. If live metadata relies on `api.github.com`, then outbound HTTPS must be permitted.
  3. Therefore, the release checklist enumerates required infra dependencies and verification steps.
