# Copilot Instructions

## Project Overview

Workshop repository for **dev10to100** — a 1-day technical workshop teaching GitHub Copilot CLI. Participants clone this repo and use it as the practice project throughout the day.

The repo contains two things:
1. **A Node.js/TypeScript REST API** (`src/`) with deliberate bugs and incomplete tests — the practice project for labs
2. **Course documentation** (`docs/`, `instructor/`) — module guides and the full instructor guide

## Language

- Course docs and commit messages: **Spanish**
- Code, variable names, identifiers, comments in `src/`: **English**

## Architecture

```
src/
  server.ts          # Express entry point
  utils.ts           # Utility functions — has 2 deliberate bugs (validateEmail, getPage)
  api/users.ts       # Users CRUD — bug: GET /users crashes on empty array
  api/auth.ts        # Auth endpoints — bug: expired tokens not checked
  legacy/            # Plain JS files with no types — Módulo 6 migration exercise
__tests__/           # Intentionally incomplete tests (filling them in is a lab exercise)
docs/                # One markdown file per module (modulo-0 through modulo-6)
instructor/          # Full instructor guide (guia-instructor.md)
scripts/             # ai-review.sh — headless Copilot CLI automation example
```

## Runtime Environment

Copy `.env.example` to `.env` before starting the server. Key variables:

| Variable | Default | Notes |
|----------|---------|-------|
| `PORT` | `3000` | Server listen port |
| `JWT_SECRET` | — | Placeholder for future JWT migration; not currently used |
| `DATABASE_URL` | — | Placeholder; all data is currently in-memory |

Both `users` (in `src/api/users.ts`) and `sessions` (in `src/api/auth.ts`) are plain in-memory arrays/objects — **all data resets on server restart**. This is intentional for the workshop.

## Build, Test, Lint

```bash
npm install
npm test                                    # Run all tests
npm run test:watch                          # Watch mode
npm run test:coverage                       # Tests with coverage report
npx jest __tests__/utils.test.ts           # Run single test file
npx jest --testNamePattern="validateEmail" # Run single test by name
npm run build                              # Compile TypeScript → dist/
npm run dev                                # Start server with ts-node (port 3000)
npm run lint                               # ESLint on src/ (.ts files)
```

## Key Conventions (from AGENTS.md)

- TypeScript strict — no `any`
- Naming: `camelCase` for functions/variables, `PascalCase` for classes/interfaces
- JSDoc on all public functions in `src/`
- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`
- Never push directly to `main`
- Do **not** modify `src/legacy/` — it's intentionally untyped for the Módulo 6 exercise
- Tests use Jest `describe/it`; `it.todo(...)` entries in `__tests__/` are intentional lab exercises — leave them as `todo` unless a lab explicitly asks to implement them
- Changes to workshop content should touch both `docs/modulo-N-*.md` **and** the corresponding section in `instructor/`

## Deliberate Bugs (do not fix unless doing a lab exercise)

| Location | Bug |
|----------|-----|
| `src/utils.ts` `validateEmail` | Rejects subdomain emails (`user@mail.example.com`) |
| `src/utils.ts` `getPage` | 0-indexed but API treats page as 1-indexed |
| `src/api/users.ts` `GET /users` | Crashes if users array is empty |
| `src/api/auth.ts` `GET /auth/me` | Does not check token expiry |

## Commit Messages

Always include this trailer:

```
Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```
