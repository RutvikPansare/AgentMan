# Reqly Decision Log

<!--
Append any non-obvious product or architecture calls here so the reasoning isn't lost.
Each entry records: date, the decision, and why it was taken.
Newest entries at the top.
-->

## 2026-06-23

**Decision:** Reqly will not host any AI models itself.
**Why:** Reqly is purely an execution engine. The intelligence lives in the user's AI agent (Cursor, Claude Code) or via a BYOK API key. This keeps the engine fast, reliable, and decoupled from rapidly changing LLM landscapes.

**Decision:** Collections will be stored as YAML files.
**Why:** YAML is human-readable, git-diffable, and easily editable in a text editor. This allows the API collections to travel with the repository and be modified cleanly by both humans and AI agents.
