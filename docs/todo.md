# Reqly - Todo

<!--
Queue of upcoming tasks. Specced in roadmap.md, picked up by AI agents.
Format is flexible - one line for simple tasks, add bullets when the agent needs context to implement without back-and-forth.
On completion: check the box, cut the line into docs/done.md under today's date.
IDs never reuse - increment from the highest T-NNN in either this file or done.md.
-->

## Queue

- [ ] **T-009** MCP Server (`src/mcp/server.ts` + `src/mcp/tools/`)
  - Follow TDD: write tool contract tests in `src/mcp/tools/*.test.ts` first - assert input schema, output shape
  - `src/mcp/server.ts`: initialise `McpServer` from `@modelcontextprotocol/sdk`, register all 7 tools, connect stdio transport
  - One file per tool in `src/mcp/tools/`: `run-request.ts`, `create-request.ts`, `create-collection.ts`, `list-collections.ts`, `set-environment.ts`, `run-collection.ts`, `get-response.ts`
  - Each tool file exports: `definition` (name, description, inputSchema) and `handler(args, engine) -> Promise<ToolResult>`
  - `engine` is a dependency-injected object containing instances of all engine modules (DI - testable without stdio)
  - Tool descriptions must be precise enough for an AI agent to call correctly with no docs
  - All tools return structured JSON - no freeform text
  - `get-response` stores last response per request name in memory (simple Map cache)
  - Run collection sequentially, stop on first error, return per-request pass/fail summary

- [ ] **T-010** CLI entry point (`src/server/index.ts`)
  - Wire together all engine modules and MCP server
  - Read `.reqly/` path from cwd (where the developer runs `reqly`)
  - Instantiate `CollectionManager`, `EnvironmentManager`, `AuthManager` with correct paths
  - Start MCP server on stdio
  - `package.json` `bin` field: `"reqly": "dist/server/index.js"`
  - After build: `reqly` command available globally via `npm link` or `npm install -g`
  - No UI yet - stdio MCP only for M1

## Backlog
