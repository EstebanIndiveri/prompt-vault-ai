---
name: commit-check
description: Verifica que los cambios staged siguen el contrato del repo antes de commitear — Conventional Commits, tests en verde, sin console.log ni archivos prohibidos.
---

# commit-check

Antes de crear cualquier commit en este repo, verificá estos puntos en orden:

## 1. Tests en verde
```bash
npm test
```
Si algún test falla, detené el proceso y reportá cuál falla y por qué.

## 2. Sin console.log de debug
```bash
git diff --cached | grep "+.*console\.log"
```
Si encontrás alguno, pedí confirmación antes de continuar.

## 3. Sin archivos prohibidos staged
Verificá que no haya `.env`, archivos en `dist/`, ni `src/legacy/` en el diff:
```bash
git diff --cached --name-only
```

## 4. Formato del mensaje de commit

El mensaje DEBE seguir Conventional Commits:
```
<tipo>(<scope opcional>): <descripción en minúscula>

<cuerpo opcional — explicar el por qué>

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

Tipos válidos: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`

✅ Correcto: `fix(auth): verificar expiración de token en GET /auth/me`  
❌ Incorrecto: `fix bug`, `update auth`, `wip`

## 5. Reportá el resultado

Mostrá un resumen:
- ✅ Tests: N passed
- ✅ Sin console.log
- ✅ Sin archivos prohibidos  
- ✅ Mensaje propuesto: `<tipo>: <descripción>`

Luego ejecutá el commit.
