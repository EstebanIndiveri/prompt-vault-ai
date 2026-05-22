# Update User (PUT /users/:id) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar el endpoint `PUT /users/:id` a `src/api/users.ts` que permite reemplazar los campos `name`, `email` y `role` de un usuario existente, excluyendo `password`.

**Architecture:** El endpoint sigue el patrón REST existente del archivo `src/api/users.ts`: aplica `authenticateToken`, valida el cuerpo, busca el usuario por `id` en el store en memoria, actualiza el objeto, y responde con los datos del usuario sin `password`. Los tests se agregan en `__tests__/users.test.ts` siguiendo el patrón de los bloques `describe` existentes.

**Tech Stack:** TypeScript, Express 4, Jest, Supertest, ts-jest

---

## File Map

| Acción   | Archivo                       | Qué cambia                                    |
|----------|-------------------------------|-----------------------------------------------|
| Modify   | `src/api/users.ts`            | Agregar handler `PUT /:id`                    |
| Modify   | `__tests__/users.test.ts`     | Agregar `describe('PUT /users/:id', ...)` con 6 casos |

---

### Task 1: Tests failing para PUT /users/:id

**Files:**
- Modify: `__tests__/users.test.ts`

- [ ] **Step 1.1: Agregar el bloque describe con los 6 casos de test**

Abrir `__tests__/users.test.ts` y agregar al final del archivo (antes del último `}`):

```typescript
describe('PUT /users/:id', () => {
  it('should update a user with valid data', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .put('/users/2')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Carlos Updated', email: 'carlos.updated@example.com', role: 'admin' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 2, name: 'Carlos Updated', email: 'carlos.updated@example.com', role: 'admin' });
    expect(res.body.password).toBeUndefined();
  });

  it('should return 404 for a non-existent user', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .put('/users/9999')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ghost', email: 'ghost@example.com' });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('User not found');
  });

  it('should return 400 if name is missing', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .put('/users/2')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'carlos@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('name is required');
  });

  it('should return 400 if email is missing', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .put('/users/2')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Carlos' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('email is required');
  });

  it('should return 400 for an invalid email format', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .put('/users/2')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Carlos', email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid email format');
  });

  it('should return 409 if email is already in use by another user', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .put('/users/2')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Carlos', email: 'ana@example.com' });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Email already in use');
  });
});
```

- [ ] **Step 1.2: Ejecutar los tests nuevos y verificar que fallan**

```bash
npx jest __tests__/users.test.ts --testNamePattern="PUT" --no-coverage
```

Salida esperada: todos los tests del bloque `PUT /users/:id` deben **FAIL** con algo como `expected 404 but received 404` o `Cannot PUT /users/2`.

- [ ] **Step 1.3: Commit de los tests (en rojo)**

```bash
git add __tests__/users.test.ts
git commit -m "test: agregar tests failing para PUT /users/:id

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 2: Implementar PUT /users/:id

**Files:**
- Modify: `src/api/users.ts`

- [ ] **Step 2.1: Agregar el handler PUT /:id en src/api/users.ts**

Abrir `src/api/users.ts` y agregar el siguiente bloque **entre el handler `DELETE /:id` y la línea `export default router;`**:

```typescript
/**
 * PUT /users/:id
 * Replaces name, email and role of an existing user. Password is not affected.
 */
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, email, role } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'name is required' });
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({ error: 'email is required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (users.find(u => u.email === email && u.id !== id)) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    users[index] = { ...users[index], name: name.trim(), email, role: role || 'user' };

    const { password: _password, ...safeUser } = users[index];
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

El archivo completo quedará con los handlers en este orden: `GET /`, `GET /:id`, `POST /`, `DELETE /:id`, `PUT /:id`.

- [ ] **Step 2.2: Ejecutar los tests nuevos y verificar que pasan**

```bash
npx jest __tests__/users.test.ts --testNamePattern="PUT" --no-coverage
```

Salida esperada: los 6 tests del bloque `PUT /users/:id` deben **PASS**.

- [ ] **Step 2.3: Ejecutar toda la suite para verificar no hay regresiones**

```bash
npm test -- --no-coverage
```

Salida esperada: todos los tests pre-existentes siguen en verde. Solo los `it.todo` se reportan como pendientes (eso es normal).

- [ ] **Step 2.4: Commit de la implementación**

```bash
git add src/api/users.ts
git commit -m "feat: implementar PUT /users/:id para actualizar usuario

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 3: Crear la GitHub Issue

- [ ] **Step 3.1: Crear la issue en GitHub**

```bash
gh issue create \
  --title "feat: agregar endpoint PUT /users/:id para actualizar usuario" \
  --body "## Descripción

Actualmente la API de usuarios tiene \`GET\`, \`POST\` y \`DELETE\` pero no tiene un endpoint de actualización.

## Tarea

Agregar \`PUT /users/:id\` en \`src/api/users.ts\` que permita reemplazar los campos \`name\`, \`email\` y \`role\` de un usuario existente.

## Criterios de aceptación

- [ ] \`PUT /users/:id\` protegido con \`authenticateToken\`
- [ ] Actualiza \`name\`, \`email\` y \`role\` (no \`password\`)
- [ ] Retorna \`200\` con usuario actualizado (sin \`password\`)
- [ ] Retorna \`400\` si \`name\` está vacío
- [ ] Retorna \`400\` si \`email\` está vacío o tiene formato inválido
- [ ] Retorna \`404\` si el usuario no existe
- [ ] Retorna \`409\` si el email ya lo usa otro usuario
- [ ] Tests en \`__tests__/users.test.ts\`

## Spec

Ver \`docs/superpowers/specs/2026-05-22-update-user-design.md\`" \
  --label "enhancement"
```

> Nota: si la etiqueta `enhancement` no existe en el repo, omitir `--label "enhancement"` o crearla antes con `gh label create enhancement --color 84b6eb`.

---
