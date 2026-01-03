# TESTING

## Conceptual test coverage plan (no mocks)

### Live registry sync & status evaluation
- **GitHub metadata ingestion:** validate `stargazers_count`, `updated_at`, `pushed_at` mapping for a known repo.
- **Non-GitHub metadata ingestion:** HEAD request returns `Last-Modified` or `Date` headers and updates `repoLastUpdated`.
- **Status matrix:** for each status outcome (LIVE, UPDATE_AVAILABLE, OFFLINE, SYNCING), test time deltas at {-1,0,1,2,3,4,5,6,7,8,9,10,11,12} minutes around thresholds to confirm deterministic boundaries.
- **Error handling:** simulate fetch timeout, 404, and CORS error to confirm OFFLINE with `lastSyncErrorAt` set.
- **Idempotence:** run `syncAgent` twice with identical metadata and assert identical agent state.

### Release readiness verification
- **Environment key injection:** confirm builds succeed with `GEMINI_API_KEY` present and fail loudly without it.
- **Outbound dependency check:** verify the deployed environment can reach `https://api.github.com` and that rate limiting is logged/handled.
- **Post-deploy smoke:** use the UI to trigger FORCE_SYNC and verify stars/timestamps update without console errors.
