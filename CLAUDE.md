# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Workshop material for "dev10to100" — a 1-day GitHub Copilot CLI training by CleverIT Group. The `src/` API is a **practice project containing deliberate bugs** that participants fix during exercises. Do not "fix" these bugs unless the task explicitly asks for it — they are pedagogical:

- `src/utils.ts` `validateEmail` — rejects subdomain emails
- `src/utils.ts` `getPage` — 0-indexed vs expected 1-indexed pagination
- `src/api/users.ts` `GET /users` — errors on empty list
- `src/api/auth.ts` `GET /auth/me` — does not check token expiration

Tests in `__tests__/` are intentionally incomplete (Module 1–2 exercise). `src/legacy/` is reserved for Module 6 — do not modify it unless the task targets that module.

## Commands

```bash
npm test                                    # all tests (Jest + ts-jest)
npx jest __tests__/utils.test.ts            # single file
npx jest --testNamePattern="validateEmail"  # by test name
npm run dev                                 # ts-node src/server.ts
npm run build                               # tsc → dist/
npm run lint                                # eslint src/ --ext .ts
```

## Conventions (from AGENTS.md)

- TypeScript strict, no `any`; JSDoc on public functions in `src/`
- Branches: `feature/` `fix/` `chore/` `docs/`; Conventional Commits
- Never push directly to `main`
- New public functions in `src/` need a test in `__tests__/`

## Repo layout note

`docs/` holds participant module guides; `instructor/` holds the instructor guide. Changes to workshop content usually touch both `docs/modulo-N-*.md` and the matching `instructor/` material.
