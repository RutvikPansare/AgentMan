# Reqly - Knowledge Base

<!--
This is the CONTEXT layer: what Reqly is and what we believe.
Reference material - slow-moving. Read it to stay aligned; don't churn it.
For what to build next, see the Roadmap section in CLAUDE.md / GEMINI.md (direction) and docs/todo.md (active work).
-->

## Core Philosophy
Reqly is an execution engine, not an AI product. The AI always lives outside Reqly. Its job is to expose reliable, well-typed tools that any AI agent can call.

- **Tool-First:** If it can't be called via MCP, it doesn't exist.
- **Dumb Server:** The server fires HTTP requests and manages files. No LLM logic.
- **Plain Text:** Collections are YAML. No binary formats.

## Architecture
- **Runtime:** Node.js + TypeScript
- **Server:** Express/Fastify serving MCP stdio interface and localhost web UI.
- **UI:** React, served as static build.
- **Config:** `~/.reqly/config.json` for global settings like BYOK key.

## What's Built
- **Core Engine:** HTTP execution, Collection Management (YAML), Environment substitution, Auth profiles.
- **MCP Server:** Tools to create, list, run requests/collections, and manage proxy.
- **Local UI:** Sidebar for collections/environments, Request Editor with params/headers/body/auth/assertions, Response Viewer with syntax highlighting and assertions results, Settings panel, Prompt bar, Multiple Tabs support for parallel editing.
- **Differentiators:** 
  - **Auto-Capture Proxy:** Captures live traffic and saves requests.
  - **Test Assertions:** Verify response status, latency, and JSON body paths.
  - **Collection Runner:** Sequentially run all requests in a collection with pass/fail tracking.
  - **Request Chaining:** Downstream requests can access previous response data via `{{requestName.response.path}}`.
