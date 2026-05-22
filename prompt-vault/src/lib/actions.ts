'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from './db';

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

  const db = getDb();
  const { lastInsertRowid } = db
    .prepare('INSERT INTO prompts (title, body) VALUES (?, ?)')
    .run(title, body);

  attachTags(Number(lastInsertRowid), data.tags);
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

  const db = getDb();
  const result = db
    .prepare('UPDATE prompts SET title = ?, body = ? WHERE id = ?')
    .run(title, body, id);

  if (result.changes === 0) throw new Error(`Prompt ${id} no encontrado.`);

  db.prepare('DELETE FROM prompt_tags WHERE prompt_id = ?').run(id);
  attachTags(id, data.tags);
  revalidatePath('/');
}

/**
 * Deletes a prompt by id (cascade removes prompt_tags rows).
 */
export async function deletePrompt(id: number): Promise<void> {
  getDb().prepare('DELETE FROM prompts WHERE id = ?').run(id);
  revalidatePath('/');
}

// ── helpers ──────────────────────────────────────────────────────────────────

function attachTags(promptId: number, tagNames: string[]): void {
  const db = getDb();
  const upsertTag = db.prepare(
    'INSERT INTO tags (name) VALUES (?) ON CONFLICT(name) DO UPDATE SET name = name RETURNING id'
  );
  const linkTag = db.prepare(
    'INSERT OR IGNORE INTO prompt_tags (prompt_id, tag_id) VALUES (?, ?)'
  );

  for (const raw of tagNames) {
    const name = raw.trim().toLowerCase().slice(0, MAX_TAG_LENGTH);
    if (!name) continue;
    const row = upsertTag.get(name) as { id: number };
    linkTag.run(promptId, row.id);
  }
}

