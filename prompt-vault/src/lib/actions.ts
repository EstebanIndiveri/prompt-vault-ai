'use server';

import { revalidatePath } from 'next/cache';
import { getDb, initSchema } from './db';

const MAX_TITLE_LENGTH = 200;
const MAX_BODY_LENGTH  = 50_000;
const MAX_TAGS         = 20;
const MAX_TAG_LENGTH   = 50;

interface PromptPayload {
  title: string;
  body: string;
  tags: string[];
}

/**
 * Validates common prompt fields.
 * @throws if any field violates length or content constraints
 */
function validatePayload(title: string, body: string, tags: string[]): void {
  if (!title || !body) throw new Error('Título y contenido son requeridos.');
  if (title.length > MAX_TITLE_LENGTH)
    throw new Error(`Título demasiado largo (máximo ${MAX_TITLE_LENGTH} caracteres).`);
  if (body.length > MAX_BODY_LENGTH)
    throw new Error(`Contenido demasiado largo (máximo ${MAX_BODY_LENGTH} caracteres).`);
  if (tags.length > MAX_TAGS)
    throw new Error(`Demasiadas etiquetas (máximo ${MAX_TAGS}).`);
}

/**
 * Creates a new prompt along with any new tags.
 * @throws on validation failure or database error
 */
export async function createPrompt(data: PromptPayload): Promise<void> {
  const title = data.title.trim();
  const body  = data.body.trim();
  validatePayload(title, body, data.tags);

  await initSchema();
  const db = getDb();
  const result = await db.execute({ sql: 'INSERT INTO prompts (title, body) VALUES (?, ?)', args: [title, body] });
  await attachTags(Number(result.lastInsertRowid), data.tags);
  revalidatePath('/');
}

/**
 * Updates an existing prompt's title, body and tags.
 * @throws on validation failure or if the prompt doesn't exist
 */
export async function updatePrompt(id: number, data: PromptPayload): Promise<void> {
  const title = data.title.trim();
  const body  = data.body.trim();
  validatePayload(title, body, data.tags);

  await initSchema();
  const db = getDb();
  const result = await db.execute({ sql: 'UPDATE prompts SET title = ?, body = ? WHERE id = ?', args: [title, body, id] });

  if (result.rowsAffected === 0) throw new Error(`Prompt ${id} no encontrado.`);

  await db.execute({ sql: 'DELETE FROM prompt_tags WHERE prompt_id = ?', args: [id] });
  await attachTags(id, data.tags);
  revalidatePath('/');
}

/**
 * Deletes a prompt by id (cascade removes prompt_tags rows).
 */
export async function deletePrompt(id: number): Promise<void> {
  await initSchema();
  await getDb().execute({ sql: 'DELETE FROM prompts WHERE id = ?', args: [id] });
  revalidatePath('/');
}

// ── helpers ──────────────────────────────────────────────────────────────────

async function attachTags(promptId: number, tagNames: string[]): Promise<void> {
  const db = getDb();
  for (const raw of tagNames) {
    const name = raw.trim().toLowerCase().slice(0, MAX_TAG_LENGTH);
    if (!name) continue;
    const tagResult = await db.execute({
      sql: 'INSERT INTO tags (name) VALUES (?) ON CONFLICT(name) DO UPDATE SET name = name RETURNING id',
      args: [name],
    });
    const tagId = tagResult.rows[0]?.id as number;
    if (tagId != null) {
      await db.execute({ sql: 'INSERT OR IGNORE INTO prompt_tags (prompt_id, tag_id) VALUES (?, ?)', args: [promptId, tagId] });
    }
  }
}


