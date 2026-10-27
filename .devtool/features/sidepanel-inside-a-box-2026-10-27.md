---
id: "sidepanel-inside-a-box-2026-10-27"
status: "backlog"
priority: "low"
assignee: null
dueDate: null
created: "2026-10-27T23:00:00.000Z"
modified: "2026-10-27T23:00:00.000Z"
completedAt: null
labels: ["phosphor"]
order: "a2"
---

# SidePanel inside a box

`SidePanel` always docks to the window and fills its full height
(`packages/phosphor/src/styles/sidepanel.css`). It cannot dock inside a
container. The Storybook docs page works around this by giving each
story its own 420px frame.

- [ ] A SidePanel can dock to a positioned ancestor instead of the window.
- [ ] The docs page renders the stories without separate frames.
