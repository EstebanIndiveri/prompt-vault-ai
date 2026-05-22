# Diseño: PUT /users/:id — Actualización de usuario

**Fecha:** 2026-05-22  
**Estado:** Aprobado

## Resumen

Agregar el endpoint `PUT /users/:id` al archivo `src/api/users.ts` para permitir reemplazar los datos de un usuario existente (sin cambiar su contraseña).

## Endpoint

```
PUT /users/:id
Authorization: Bearer <token>
```

### Cuerpo (JSON)

| Campo | Tipo   | Requerido | Descripción              |
|-------|--------|-----------|--------------------------|
| name  | string | sí        | Nombre completo          |
| email | string | sí        | Email único del usuario  |
| role  | string | no        | Rol; default `"user"`    |

### Respuestas

| Código | Descripción                              |
|--------|------------------------------------------|
| 200    | Usuario actualizado (sin campo password) |
| 400    | Validación fallida (name, email vacío o email inválido) |
| 404    | Usuario no encontrado                    |
| 409    | Email ya en uso por otro usuario         |
| 500    | Error interno                            |

## Validaciones

1. `name` — string no vacío
2. `email` — string no vacío y válido según `validateEmail` de `src/utils.ts`
3. Email no duplicado en otro usuario (diferente `id`)
4. `role` — opcional, default `"user"`
5. `password` — no modificable por este endpoint

## Arquitectura

- Se añade en `src/api/users.ts` siguiendo el mismo patrón de `POST /users`
- Usa `authenticateToken` middleware igual que todos los demás endpoints
- Actualiza el objeto directamente en el array `users` del store en memoria
- Respuesta excluye `password` usando destructuring

## Tests

Nuevos casos en `__tests__/users.test.ts`, bloque `describe('PUT /users/:id')`:

- Actualiza correctamente un usuario existente → 200
- Retorna 404 para usuario inexistente
- Retorna 400 si falta `name`
- Retorna 400 si falta `email`
- Retorna 400 si el email tiene formato inválido
- Retorna 409 si el email ya lo usa otro usuario
