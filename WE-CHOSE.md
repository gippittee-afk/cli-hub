# WE-CHOSE

## Three-perspective evaluation

### Perspective: CEO
- **Goal:** Ship a registry that users can trust during launch and demos.
- **Decision logic:** Replace simulated syncing with real metadata pulls so the experience matches observable reality. This reduces reputational risk during release.

### Perspective: Junior Developer
- **Goal:** Build a maintainable sync pipeline without rewriting the UI.
- **Decision logic:** Keep the sync API surface (`checkStatus`, `syncAgent`) but make the internals deterministic and data-driven. This minimizes churn while eliminating fake behavior.

### Perspective: End Customer
- **Goal:** See accurate status and updates, not “game-like” placeholders.
- **Decision logic:** Provide real repo metadata with clear offline detection and update signals. This makes the registry feel reliable and current.

## Final choice mapping
- **Selected implementation:** Live metadata sync with deterministic status evaluation.
- **Mapped to logic chain:** Real data → stored timestamps → deterministic status rules → trustworthy UI state.
