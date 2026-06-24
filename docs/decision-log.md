# Reqly Decision Log

<!--
Append any non-obvious product or architecture calls here so the reasoning isn't lost.
Each entry records: date, the decision, and why it was taken.
Newest entries at the top.
-->

## 2026-06-24

**Decision:** Adopted `lucide-react` as the single icon library for the localhost UI, replacing all hand-rolled inline `<svg>` blocks (stroke-style nav icons and Bootstrap-icons-style fill paths that had crept in across components).
**Why:** Two inconsistent icon styles (stroke vs Bootstrap fill) had accumulated across NavRail, KeyValueEditor, EnvironmentsPanel, EnvironmentSwitcher, ResponseViewer, and App.tsx tab bar. Lucide is MIT-licensed, tree-shakeable, and matches the Hoppscotch-reference aesthetic CLAUDE.md's UI section calls for. One import path going forward instead of copy-pasted SVG markup per icon.

**Decision:** GraphQL moved out of the REST request editor into its own full-workspace nav rail section (`GraphQLWorkspace.tsx`), replacing the earlier REST/GQL mode toggle inside `RequestEditor.tsx`. GraphQL requests are not persisted to collection YAML and have no save/collection affordance - the workspace is ephemeral, scoped to one query/variables/response at a time.
**Why:** A mode toggle buried inside the REST editor made GraphQL feel like an afterthought and complicated `RequestEditor.tsx` with parallel state (query, variables, schema, introspection) that only applied in one of two modes. Hoppscotch's pattern - GraphQL as its own first-class workspace - is clearer for users and keeps the REST editor simple. Not persisting GraphQL requests to collections is a deliberate scope cut for this task; saved/named GraphQL requests can be a follow-up if needed.

**Decision:** Remove the in-app Prompt Bar and BYOK (API key + model selector) from Settings. Settings panel stays in the UI as an empty placeholder for future preferences; `GET/POST /api/config` and `~/.reqly/config.json` stay in place as generic config storage, just with no BYOK fields written to them anymore.
**Why:** Reqly's tool-first principle puts the AI outside the engine - developers already drive Reqly via MCP from their own Cursor/Claude Code agent. An in-app LLM prompt bar duplicated that capability with extra surface area (a second LLM integration, a second API key to manage) for no advantage at this stage.

**Decision:** Persist active UI state (tabs, active tab, active nav panel) to `localStorage` via a debounced `useLocalStorage` hook, and strip response bodies + auth credentials from tabs before writing. Active environment continues to persist in `environments.yaml` (server-side), not `config.json` as the task spec suggested.
**Why:** The spec assumed active environment was in-memory only, but `EnvironmentManager.setActiveEnvironment` already writes `store.active` to `environments.yaml` and `getActiveEnvironment` reads it back - so the server-side half was already satisfied and no config.json change was needed. For localStorage, response bodies are ephemeral and can be large (would blow past the ~5MB quota fast), and auth credentials / env variable values are sensitive - both must be stripped before persisting tabs. The 300ms debounce prevents a storage write on every keystroke (the dirty-tracking `onChange` fires continuously). Rehydrated tabs restore with `response: null` and `isSending: false`.

**Decision:** GraphQL support is a UI-mode toggle on the request editor (`mode: 'graphql'`), not a separate request type, executor path, or MCP tool. The editor assembles `{ query, variables }` as the body object and the existing HTTP executor handles it transparently (it already stringifies object bodies and sets `Content-Type: application/json`).
**Why:** The executor is method+body agnostic - a GraphQL request is just a POST with a JSON `{ query, variables }` body. Adding a parallel GraphQL executor or a new MCP tool would duplicate the HTTP path for no behavioural gain and violate the engine-agnostic principle. Keeping the mode flag on the request (persisted to YAML) lets the UI render the query/variables editor while the engine stays dumb. Introspection runs through the normal adhoc run endpoint, so no new backend route was needed either. Schema autocomplete is intentionally minimal (field list display) for the MVP - a full CodeMirror-style autocomplete is deferred.

**Decision:** Request history lives in a dedicated `HistoryStore` engine module (in-memory, capped at 200 entries) on `EngineContext`, parallel to `ResponseStore`, rather than as a server-only array or persisted file.
**Why:** History must capture every fired request regardless of entry point - adhoc UI runs, MCP `run_request`, and collection runs all need to append. Putting the store on `EngineContext` (the shared seam both the MCP tools and Express handlers already hold) means every execution path logs through one `append` call with no special-casing, and the UI's `GET /api/history` reads the same source. In-memory (no YAML persistence) matches the T-043 spec's MVP scope: history is a working scratchpad, not a committed artifact. The 200-entry cap bounds memory for long sessions.

**Decision:** Environment editing moved from a modal dialog to an inline, expandable variable table inside the Environments nav-rail panel; the standalone EnvironmentEditor modal was removed.
**Why:** The nav rail already owns the Environments surface. Inlining the Key/Value table with add/remove rows and per-environment Save keeps editing in context (the user is already looking at the list), avoids a second modal for routine variable tweaks, and matches Hoppscotch's inline environments editor pattern. Required adding `EnvironmentManager.deleteEnvironment` (TDD) and `DELETE /api/environments/:name`, which the task spec assumed already existed.

**Decision:** Split the monolithic Sidebar into a left icon NavRail plus switchable per-function panels (Collections / Environments / History / Capture).
**Why:** The M4 UI growth tasks (T-041 environment editor, T-043 history panel) need dedicated sidebar surfaces. A nav rail that swaps the panel content keeps a single 64px sidebar column while giving each function its own full-height view, matching Hoppscotch's Sidenav pattern without mirroring its right-side collection layout. Settings stays a modal (BYOK config does not fit a narrow column); the rail's Settings icon opens that modal rather than rendering inline.

## 2026-06-23

**Decision:** Reqly will not host any AI models itself.
**Why:** Reqly is purely an execution engine. The intelligence lives in the user's AI agent (Cursor, Claude Code) or via a BYOK API key. This keeps the engine fast, reliable, and decoupled from rapidly changing LLM landscapes.

**Decision:** Collections will be stored as YAML files.
**Why:** YAML is human-readable, git-diffable, and easily editable in a text editor. This allows the API collections to travel with the repository and be modified cleanly by both humans and AI agents.
