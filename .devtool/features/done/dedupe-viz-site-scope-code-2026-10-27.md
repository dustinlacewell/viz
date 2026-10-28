---
id: "dedupe-viz-site-scope-code-2026-10-27"
status: "done"
priority: "low"
assignee: null
epic: null
dueDate: null
created: "2026-10-27T00:00:00.000Z"
modified: "2026-10-28T02:05:00.000Z"
completedAt: "2026-10-28T02:05:00.000Z"
labels: []
order: "a5"
---
# Dedupe viz-site scope code

`apps/viz-site/src/shared/scope/` (used by the home and phosphor pages) and `apps/viz-site/src/pages/scope/scope/` were two diverged copies of the same scope wiring.

Resolved: the scope page's bench-scope demo replaced its playground, and `pages/scope/scope/` was deleted. `shared/scope/` is now the only copy. The `BASE_URL` bug moved to its own card, `heroscope-ignores-base-url-2026-10-28`.
