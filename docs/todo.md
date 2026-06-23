# Reqly - Todo

<!--
Queue of upcoming tasks. Specced in roadmap.md, picked up by AI agents.
Format is flexible - one line for simple tasks, add bullets when the agent needs context to implement without back-and-forth.
On completion: check the box, cut the line into docs/done.md under today's date.
IDs never reuse - increment from the highest T-NNN in either this file or done.md.
-->

## Queue








## Backlog

- [ ] **T-025** Request Chaining - response context store
  - Follow TDD: write `src/engine/response-store.test.ts` first
  - `ResponseStore` class: in-memory map of `requestName -> HttpResponse`
  - Extend `variable-substitutor.ts` to resolve `{{requestName.response.status}}`, `{{requestName.response.body.field}}`
