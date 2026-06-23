# Reqly - Todo

<!--
Queue of upcoming tasks. Specced in roadmap.md, picked up by AI agents.
Format is flexible - one line for simple tasks, add bullets when the agent needs context to implement without back-and-forth.
On completion: check the box, cut the line into docs/done.md under today's date.
IDs never reuse - increment from the highest T-NNN in either this file or done.md.
-->

## Queue

- [ ] **T-010** CLI entry point (`src/server/index.ts`)
  - Wire together all engine modules and MCP server
  - Read `.reqly/` path from cwd (where the developer runs `reqly`)
  - Instantiate `CollectionManager`, `EnvironmentManager`, `AuthManager` with correct paths
  - Start MCP server on stdio
  - `package.json` `bin` field: `"reqly": "dist/server/index.js"`
  - After build: `reqly` command available globally via `npm link` or `npm install -g`
  - No UI yet - stdio MCP only for M1

## Backlog
