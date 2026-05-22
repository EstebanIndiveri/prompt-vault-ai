# AGENTS.md

## Propósito de este archivo

Este archivo define cómo se comporta el agente de IA (Copilot CLI) en este repositorio.
Es un ejemplo de AGENTS.md — parte del contenido del Módulo 3 del workshop.

---

## Estilo de código

- **TypeScript estricto** — `strict: true`, `noImplicitAny: true` (ver `tsconfig.json`), sin `any`
- Naming: `camelCase` para funciones y variables, `PascalCase` para clases e interfaces
- **JSDoc obligatorio** en todas las funciones públicas en `src/`: incluir `@param`, `@returns`, y `@throws` si aplica
- No usar `console.log` en producción — es deuda técnica existente, no agregar más
- Target ES2020, módulos CommonJS (ver `tsconfig.json`)
- Sin dependencias nuevas sin justificación — el proyecto usa solo `express` en runtime

## Git

- Branches: `feature/`, `fix/`, `chore/`, `docs/`
- **Commits: Conventional Commits** — `feat:`, `fix:`, `chore:`, `docs:`, `test:`
  - Ejemplo correcto: `fix: validar subdominios en validateEmail`
  - Ejemplo incorrecto: `fix bug`, `update`, `wip`
- NUNCA hacer push directo a `main`
- PRs requieren descripción con: causa raíz, solución, tests y `Closes #N`
- Incluir siempre el trailer: `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`

## Tests

- **TDD obligatorio**: escribir tests que fallen ANTES de implementar
- Cada función pública nueva en `src/` debe tener test en `__tests__/`
- Usar Jest con patrón `describe/it` — framework: `ts-jest`
- Cubrir siempre tres capas: happy path + edge cases + error cases
- Ejecutar `npm test` antes de hacer commit — debe estar limpio
- Para correr un test específico: `npx jest __tests__/archivo.test.ts`
- Para correr por nombre: `npx jest --testNamePattern="nombre"`

## Comandos del proyecto

```bash
npm test              # correr todos los tests
npm run test:watch    # modo watch
npm run build         # compilar TypeScript → dist/
npm run dev           # iniciar servidor con ts-node
npm run lint          # eslint src/ --ext .ts
```

## Restricciones críticas

- **⛔ No modificar `src/legacy/`** — ese código es parte del ejercicio del Módulo 6
- No commitear `.env` ni secrets — usar `.env.example` con placeholders
- No ejecutar comandos destructivos (`DROP TABLE`, `rm -rf`) sin confirmación explícita
- No crear PRs sin haber corrido la suite completa en verde
- Los bugs deliberados en `src/utils.ts` y `src/api/` son intencionales — no corregirlos salvo que el task lo pida explícitamente

## Bugs deliberados (no corregir salvo indicación)

| Archivo | Bug |
|---------|-----|
| `src/utils.ts` → `validateEmail` | Rechaza emails con subdominio |
| `src/utils.ts` → `getPage` | Paginación 0-indexed vs 1-indexed |
| `src/api/users.ts` → `GET /users` | Crash con array vacío |
| `src/api/auth.ts` → `GET /auth/me` | No verifica expiración del token |
