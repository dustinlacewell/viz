---
id: "dedupe-viz-site-scope-code-2026-10-27"
status: "todo"
priority: "low"
assignee: null
epic: null
dueDate: null
created: "2026-10-27T00:00:00.000Z"
modified: "2026-10-27T00:00:00.000Z"
completedAt: null
labels: []
order: "a5"
---
# Dedupe viz-site scope code

`apps/viz-site/src/shared/scope/` (used by the home and phosphor pages) and `apps/viz-site/src/pages/scope/scope/` are two diverged copies of the same scope wiring. They came from the old phosphor-site and scope-site apps.

- Shared and identical: `signal/*-dials.ts`, `preset/pointer-dials.ts`, `preset/screen-dials.ts`, `react/useBeamFn.ts`, `react/useScopePumpers.ts`.
- Diverged: `preset/snap.ts`, the TuningPanel (folder vs single file).
- Only in one copy: shared has `HeroScope`, `hero-preset.ts`, `network.ts`; scope has `ScopeStage`, `preset.ts`, `store.ts`.

Move the shared part to one place. Also: phosphor's `HeroScope` hardcodes `/scope-preset.json` and `/cursor.png` and ignores `BASE_URL`.
