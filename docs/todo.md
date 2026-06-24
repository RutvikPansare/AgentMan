# Reqly - Todo

<!--
Queue of upcoming tasks. Specced in roadmap.md, picked up by AI agents.
Format is flexible - one line for simple tasks, add bullets when the agent needs context to implement without back-and-forth.
On completion: check the box, cut the line into docs/done.md under today's date.
IDs never reuse - increment from the highest T-NNN in either this file or done.md.
-->

## Queue

## CLI Runner (M4)

- [ ] **T-056** CLI sub-command routing
  - Update `src/server/index.ts` to parse `process.argv` and route to either `start` or `run`
  - `reqly start` - existing behavior (starts Express + MCP server, opens UI)
  - `reqly run <collection> [request]` - new behavior (runs collection/request, exits)
  - If no sub-command given, default to `start` for backwards compatibility
  - Parse flags early and pass them down: `--env <name>`, `--reporter <format>`, `--project-dir <path>`
  - The `--project-dir` flag (discussed earlier) should also be wired in here - resolves `process.cwd()` override for MCP clients that launch from home dir
  - Tests: `src/server/index.test.ts` - unit test the arg parsing logic in isolation (extract it to a pure `parseArgs(argv)` function)

- [ ] **T-057** `reqly run` - CLI collection runner with output and exit codes
  - New file: `src/server/run-command.ts` - the handler for `reqly run`
  - Instantiates engine directly (CollectionManager, EnvironmentManager, AuthManager, ResponseStore) from the resolved project dir - no Express, no MCP server, no UI
  - If `[request]` argument given: runs a single request by name within the collection
  - If only `<collection>` given: runs all requests sequentially using the existing `CollectionRunner` engine
  - Output format (default, human-readable):
    ```
    Running collection: payments
    
      ✓  POST  create_payment       201  142ms
      ✓  GET   get_payment          200   89ms
      ✗  DEL   delete_payment       404  201ms
            Expected status 200, got 404
    
    Results: 2 passed, 1 failed
    ```
  - Exit code 0 if all requests pass (or no assertions fail), exit code 1 if any fail
  - Supports `--env <name>` to activate a named environment before running
  - Tests: `src/server/run-command.test.ts` - mock the engine, assert output format and exit codes

- [ ] **T-058** CI-friendly output reporters
  - Add `--reporter <format>` flag to `reqly run`, default is `pretty` (human-readable from T-057)
  - `--reporter json`: emit a single JSON object to stdout:
    ```json
    {
      "collection": "payments",
      "passed": 2,
      "failed": 1,
      "results": [
        { "name": "create_payment", "method": "POST", "status": 201, "latency": 142, "passed": true },
        { "name": "delete_payment", "method": "DELETE", "status": 404, "latency": 201, "passed": false, "error": "Expected status 200, got 404" }
      ]
    }
    ```
  - `--reporter tap`: TAP format (Test Anything Protocol) - supported natively by GitHub Actions, Jest, and most CI dashboards
  - Exit codes unchanged: 0 = all pass, 1 = any fail, regardless of reporter
  - Tests: assert each reporter produces the correct output shape for a known set of results

- [ ] **T-059** npm package publishing setup
  - Add `bin` field to root `package.json`: `{ "reqly": "./dist/server/index.js" }`
  - **Pre-build the UI into the package:** add a root-level `build` script that runs `tsc` AND `cd src/ui && npm install && npm run build`. The UI's `dist/` output must be copied into `dist/ui/` so the Express server can serve it without the user ever touching `src/ui/`
  - The npm package must include the pre-built UI (`dist/ui/`) - users should never need to `cd src/ui && npm install && npm run build` themselves
  - Add `.npmignore`: exclude `src/`, `example/`, `*.test.*`, `.env*`, `docs/`. Include `dist/` explicitly.
  - Verify the compiled binary is executable: `#!/usr/bin/env node` shebang at top of `dist/server/index.js`
  - Add `reqly --version` command that prints version from `package.json`
  - Dry-run test: `npm pack` and inspect the tarball - should contain `dist/` and nothing else of note
  - Do NOT publish to npm yet - just make it ready. Publishing is a separate manual step.

- [ ] **T-060** `reqly setup` - one-command MCP configuration
  - New sub-command: `reqly setup` (or `reqly setup cursor` / `reqly setup claude`)
  - Goal: user runs this once after `npm install -g reqly` and their AI tool is configured. No manual JSON editing, no path copying.
  - The command knows its own binary path via `process.argv[0]` or `which reqly` - it uses this to write the config, so the user never has to find a path themselves
  - **Interactive flow (no arguments given):**
    ```
    ? Which AI tool do you use?
      1. Cursor
      2. Claude Desktop
      3. Claude Code (CLI)
      4. All of the above
    ```
  - **Cursor:** writes/merges into `~/.cursor/mcp.json`:
    ```json
    { "mcpServers": { "reqly": { "command": "reqly", "args": ["start"] } } }
    ```
  - **Claude Desktop:** writes/merges into `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) or the Windows equivalent
  - **Claude Code:** prints the one-liner to run: `claude --mcp-server reqly` (Claude Code reads from its own config - print the instruction clearly)
  - If the config file already has a `reqly` entry, ask: "Reqly is already configured. Overwrite? (y/N)"
  - On success: print "Done! Restart [tool] and type 'list my Reqly collections' to test it."
  - Tests: mock the filesystem writes, assert correct JSON shape for each target tool

- [ ] **T-061** AI-readable README and llms.txt
  - **The goal:** a developer pastes the GitHub repo URL into any AI (Claude, Cursor, ChatGPT, Gemini) and says "set up Reqly for my workspace" - the AI reads the README and executes the setup with zero human steps.
  - **README.md** (root level) - write it fresh, structured for AI consumption first, humans second:
    - First section: "Quick Setup" - exactly two commands, nothing else:
      ```
      npm install -g reqly
      reqly setup
      ```
    - Second section: "What Reqly does" - one short paragraph. No marketing. What it is, what the MCP tools are, what `localhost:4242` shows.
    - Third section: "MCP Tools" - a table listing every tool name, what it does, and its key parameters. This is what an AI reads to know what it can call.
    - Fourth section: "How collections work" - YAML format, where `.reqly/` lives, that it's git-native.
    - Fifth section: "CLI Runner" - `reqly run <collection>` usage, flags, exit codes.
    - Keep it under 150 lines total. No badges, no screenshots, no contribution guides in the main README.
  - **llms.txt** (root level) - an emerging standard (llmstxt.org) for AI-readable project context:
    - Single plain-text file, no markdown formatting
    - Contains: what Reqly is (2 sentences), the two install commands, all MCP tool names and descriptions, the YAML collection format with one example, and a note that `localhost:4242` is the UI
    - An AI fetching this file should have everything it needs to install and use Reqly without reading anything else
  - **Prerequisite:** T-059 (npm package) and T-060 (`reqly setup`) must be done first - the README is only accurate once those work



