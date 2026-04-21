# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

Three sub-projects in the root:
- `CLI/` — The main TypeScript CLI tool published to npm globally as `giltol`
- `client/` — Next.js frontend (not yet implemented)
- `server/` — Empty, not yet implemented

## CLI

### Commands

```bash
cd CLI
npm run dev          # run with tsx (no build needed)
npm run build        # compile TypeScript to dist/
npm install -g .     # reinstall globally after build (regenerates giltol.cmd on Windows)
```

### Running the tool

```bash
giltol               # starts interactive LLM chat session
giltol hello <name>  # greets by name
giltol hello <name> --shout  # uppercase greeting
```

### Key architecture

- Entry: `src/index.ts` — uses `commander` for subcommands, top-level `await` for the interactive loop
- Interactive mode triggers when `process.argv.length === 2` (no subcommand given)
- LLM: `@langchain/openai` with `gpt-4o-mini`, API key loaded from `CLI/.env` via `dotenv` using `import.meta.url`-relative path
- On startup, reads the current working directory's folder structure and file contents via `src/readProject.ts`, passed as a system message once per session
- Conversation history is maintained in a `messages` array across the session — project context is sent only once, not on every query
- Session ends on `/exit` or `Ctrl+C`

### Environment

`CLI/.env` (never committed):
```
OPENAI_API_KEY=sk-...
```

### Windows gotcha

After `npm run build`, always run `npm install -g .` to regenerate `giltol.cmd` — otherwise Windows may not invoke Node correctly.

### Module system

Uses ESM (`"type": "module"`, `"module": "NodeNext"`). All local imports must use `.js` extension even when importing `.ts` files.
