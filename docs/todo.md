# Reqly - Todo

<!--
Queue of upcoming tasks. Specced in roadmap.md, picked up by AI agents.
Format is flexible - one line for simple tasks, add bullets when the agent needs context to implement without back-and-forth.
On completion: check the box, cut the line into docs/done.md under today's date.
IDs never reuse - increment from the highest T-NNN in either this file or done.md.
-->

## Queue

- [ ] **T-062** Response truncation for large payloads (MCP + engine)
  - When an API returns a large response (e.g. thousands of rows, binary data, huge JSON), returning the full body to an AI agent blows out its context window
  - **Engine change:** add a `maxBodyBytes` limit (default: 50KB) to the HTTP executor. If the response body exceeds this, truncate it and append a metadata note: `[Response truncated: 1.2MB received, showing first 50KB. Use --full to retrieve complete response.]`
  - **MCP tool change:** add an optional `truncate` parameter to `run_request` (default: `true`). When `false`, the full body is returned. This lets agents opt in to full responses when they know the payload is small.
  - **New MCP tool:** `get_response_full` - retrieves the complete untruncated last response for a named request from the ResponseStore. Agents call this when they need the full payload after seeing the truncated version.
  - **Config:** add `maxBodyBytes` to `~/.reqly/config.json` so power users can raise or lower the limit
  - **Tests (mandatory - engine change):** unit test the truncation logic in `src/engine/http-executor.test.ts`. Assert: body under limit passes through unchanged, body over limit is truncated with the correct metadata suffix, `truncate: false` bypasses the limit entirely.



