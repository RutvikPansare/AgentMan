# Reqly - Todo

<!--
Queue of upcoming tasks. Specced in roadmap.md, picked up by AI agents.
Format is flexible - one line for simple tasks, add bullets when the agent needs context to implement without back-and-forth.
On completion: check the box, cut the line into docs/done.md under today's date.
IDs never reuse - increment from the highest T-NNN in either this file or done.md.
-->

## Queue







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









