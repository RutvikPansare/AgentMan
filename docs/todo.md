# Reqly - Todo

<!--
Queue of upcoming tasks. Specced in roadmap.md, picked up by AI agents.
Format is flexible - one line for simple tasks, add bullets when the agent needs context to implement without back-and-forth.
On completion: check the box, cut the line into docs/done.md under today's date.
IDs never reuse - increment from the highest T-NNN in either this file or done.md.
-->

## Queue

- [ ] **T-026** Sidebar - functional collection tree
  - **Pre-check (do this first):** Buttons and sidebar items are currently unresponsive to clicks. Before building anything, open Chrome DevTools on `localhost:4242` and diagnose: (1) check the Console tab for JS errors that may have halted event registration; (2) in the Elements panel, hover over a non-working button and confirm the element under the cursor is the button itself - if it's a parent div or overlay, find and remove it; (3) check for any `position: fixed` or `position: absolute` element with no `pointer-events: none` that covers the viewport. Fix the root cause before proceeding with the rest of this task.
  - Currently renders "ENVIRONMENTS" and "COLLECTIONS" as static labels with no content
  - On mount: fetch `GET /api/collections`, render each collection as a collapsible folder row
  - Collection row: chevron icon (rotates on expand) + collection name + `+` icon button to add a request (opens inline name input)
  - "New collection" button above the list: small `+ New` button, clicking inserts a text input at top of list, Enter to confirm calls `POST /api/collections`, Escape to cancel
  - Expanded collection shows its requests as child rows: method badge (GET=blue, POST=green, PUT=amber, PATCH=orange, DELETE=red, all `text-xs font-mono`) + request name
  - Click a request row: sets it as the active request, pre-fills the Request Editor via shared state or context
  - Right-click a request row: context menu with "Rename" and "Delete". Delete calls `DELETE /api/collections/:name/requests/:requestName` and refetches. Rename calls `PUT` with updated name.
  - Active request row: `bg-zinc-800` highlight
  - Empty collection: show muted "No requests" text when expanded
  - ENVIRONMENTS section: show list of environment names from `GET /api/environments`, active one marked with a dot. Click to set active via `PUT /api/environments/:name/active`.

- [ ] **T-027** Top bar - environment switcher + settings icon
  - Currently only shows "Reqly" wordmark with no controls
  - Top bar is `h-10 border-b border-zinc-800 flex items-center px-4 justify-between`
  - Left: "Reqly" wordmark (existing)
  - Right side: environment switcher dropdown + gear icon button
  - Environment switcher: compact select-style button showing active environment name (or "No env" if none). Click opens a popover list of all environments from `GET /api/environments`. Click an env to activate via `PUT /api/environments/:name/active`. "New environment" option at bottom opens a modal (name input + key-value variable table).
  - Gear icon: `<button>` with a settings/gear SVG icon. Click opens the Settings Panel (slide-in from right, already specified in T-017 but needs to be triggered from here).
  - Popover closes on outside click or Escape key

- [ ] **T-028** Auth tab - complete editor
  - Currently shows static "auth editor coming soon..." text
  - Replace with functional auth editor:
  - Auth type selector at top: radio buttons or segmented control for "None" / "Bearer Token" / "API Key" / "Basic"
  - "None": no additional inputs
  - "Bearer Token": single text input labelled "Token". Value is sent as `Authorization: Bearer <token>` header
  - "API Key": key name input + value input + placement toggle (Header / Query param). Key name defaults to `X-API-Key`.
  - "Basic": username input + password input (`type="password"`). Encoded as `Authorization: Basic <base64>` on send.
  - Auth values are stored in the current request editor state (not saved to collection until user hits Save)
  - "Save as profile" button: takes current auth config, calls `POST /api/auth-profiles { name, type, credentials }` to persist it for reuse. Named profiles then appear in a dropdown at the top so users can pick a saved profile.

- [ ] **T-029** Response Viewer - complete implementation
  - Currently shows only "No response yet" with no structure
  - Split layout: Request Editor top half, Response Viewer bottom half, with a drag handle between them (default 50/50)
  - Response Viewer has a persistent header row even when empty: "Response" label on the left + status badge area on the right
  - Empty state: muted "Send a request to see the response" centred in the panel
  - On response received: status badge (e.g. `200 OK` green / `404 Not Found` red / `500` red) + latency (e.g. `124ms`) in the header row
  - Three tabs below header: Body | Headers | Raw
  - Body tab: if content-type is JSON, render pretty-printed JSON in a `<pre>` with basic syntax colouring (strings=green, numbers=blue, keys=zinc-300, via CSS spans). Otherwise render plain text. "Copy" button top-right copies raw body to clipboard.
  - Headers tab: two-column table (header name | value), monospace font, `border-b border-zinc-800` rows
  - Raw tab: raw response string in a `<pre>` block, horizontal scroll if long
  - Loading state while request in-flight: header row shows "Sending..." with a small spinner, tabs are disabled

- [ ] **T-030** Prompt bar - wire up and make visible
  - Currently not visible in the UI - needs to be added to the layout
  - Fixed bar pinned to the bottom of the main content area (not the sidebar), above no other element
  - `border-t border-zinc-800 bg-zinc-950 px-4 py-2 flex gap-2 items-center`
  - Left: lock icon if no API key is set (from `GET /api/config hasApiKey`), otherwise a sparkle/wand icon
  - Text input: `flex-grow`, placeholder "Describe what you want Reqly to do..."
  - Submit on Enter or arrow button on the right
  - If `hasApiKey` is false: input is `disabled`, tooltip on hover says "Add your API key in Settings"
  - On submit: POST to `POST /api/prompt { prompt }`, show a loading indicator
  - Response appears in a collapsible output drawer that slides up from above the prompt bar: shows the LLM's plain-text reply + any actions it took (e.g. "Created collection `payments`, added 3 requests")
  - Drawer has an X close button. Auto-opens on response, persists until closed.









