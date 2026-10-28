---
id: "heroscope-ignores-base-url-2026-10-28"
status: "todo"
priority: "low"
assignee: null
dueDate: null
created: "2026-10-28T02:05:00.000Z"
modified: "2026-10-28T02:05:00.000Z"
completedAt: null
labels: ["bug"]
order: "a6"
---
# HeroScope ignores BASE_URL

`apps/viz-site/src/shared/scope/` `HeroScope` hardcodes `/scope-preset.json` and `/cursor.png`. Under a non-root `BASE_URL` both fetches miss. Build the paths from `import.meta.env.BASE_URL`.
