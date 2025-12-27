# TESTING

## Conceptual test coverage plan (no mocks)

### Authentication & RBAC
- **Token validation edge cases:** expired, not-yet-valid, invalid signature, missing audience, wrong issuer.
- **Role enforcement:** verify allow/deny across roles with boundary conditions.
- **Command matrix:** for each CLI command, test with roles {-1,0,1,2,3,4,5,6,7,8,9,10,11,12} mapped to permission tiers to confirm explicit allow/deny results.

### Observability & Audit Logging
- **Structured log schema:** validate presence of correlation IDs, user IDs, command name, latency, and outcome codes.
- **Trace propagation:** ensure context flows through nested commands and sub-processes.
- **Audit immutability:** verify append-only behavior under concurrent writes and failure scenarios.

### Update & Release Management
- **Signature verification:** verify acceptance of valid signatures and rejection of tampered artifacts.
- **Versioned migrations:** ensure backward-compatible upgrade paths and rollback integrity.
- **Failure injection:** simulate partial download, network loss, and corrupt cache to confirm safe aborts.
