# AgentMan - Knowledge Base

<!--
This is the CONTEXT layer: what AgentMan is and what we believe.
Reference material - slow-moving. Read it to stay aligned; don't churn it.
For what to build next, see the Roadmap section in CLAUDE.md / GEMINI.md (direction) and docs/todo.md (active work).
-->

## Core Philosophy
AgentMan is an execution engine, not an AI product. The AI always lives outside AgentMan. Its job is to expose reliable, well-typed tools that any AI agent can call.

- **Tool-First:** If it can't be called via MCP, it doesn't exist.
- **Dumb Server:** The server fires HTTP requests and manages files. No LLM logic.
- **Plain Text:** Collections are YAML. No binary formats.

## Architecture
- **Runtime:** Node.js + TypeScript
- **Server:** Express/Fastify serving MCP stdio interface and localhost web UI.
- **UI:** React, served as static build.
- **Config:** `~/.agentman/config.json` for global settings like BYOK key.
