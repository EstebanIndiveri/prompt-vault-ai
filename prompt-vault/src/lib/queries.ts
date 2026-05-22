import { getDb } from './db';
import type { Prompt, Tag } from './types';

interface RawPrompt {
  id: number;
  title: string;
  body: string;
  created_at: string;
}

interface RawTagRow {
  prompt_id: number;
  tag_id: number;
  tag_name: string;
}

/**
 * Fetches all prompts with their tags using a single JOIN query (no N+1).
 */
export function getAllPrompts(): Prompt[] {
  const db = getDb();

  const prompts = db
    .prepare<[], RawPrompt>(
      'SELECT id, title, body, created_at FROM prompts ORDER BY created_at DESC'
    )
    .all();

  if (prompts.length === 0) return [];

  const placeholders = prompts.map(() => '?').join(',');
  const promptIds = prompts.map((p) => p.id);

  const tagRows = db
    .prepare<number[], RawTagRow>(
      `SELECT pt.prompt_id, t.id AS tag_id, t.name AS tag_name
       FROM prompt_tags pt
       JOIN tags t ON pt.tag_id = t.id
       WHERE pt.prompt_id IN (${placeholders})
       ORDER BY t.name`
    )
    .all(...promptIds);

  const tagsByPrompt: Record<number, Tag[]> = {};
  for (const row of tagRows) {
    if (!tagsByPrompt[row.prompt_id]) tagsByPrompt[row.prompt_id] = [];
    tagsByPrompt[row.prompt_id].push({ id: row.tag_id, name: row.tag_name });
  }

  return prompts.map((p) => ({ ...p, tags: tagsByPrompt[p.id] ?? [] }));
}

/**
 * Fetches all unique tags ordered by name.
 */
export function getAllTags(): Tag[] {
  return getDb()
    .prepare<[], Tag>('SELECT id, name FROM tags ORDER BY name')
    .all();
}

