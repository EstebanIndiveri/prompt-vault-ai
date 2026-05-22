import { getDb, initSchema } from './db';
import type { Prompt, Tag } from './types';

/**
 * Fetches all prompts with their tags using a single JOIN query (no N+1).
 */
export async function getAllPrompts(): Promise<Prompt[]> {
  await initSchema();
  const db = getDb();

  const promptsResult = await db.execute(
    'SELECT id, title, body, created_at FROM prompts ORDER BY created_at DESC'
  );

  const prompts = promptsResult.rows as unknown as Array<{
    id: number; title: string; body: string; created_at: string;
  }>;

  if (prompts.length === 0) return [];

  const placeholders = prompts.map(() => '?').join(',');
  const promptIds = prompts.map((p) => p.id);

  const tagsResult = await db.execute({
    sql: `SELECT pt.prompt_id, t.id AS tag_id, t.name AS tag_name
          FROM prompt_tags pt
          JOIN tags t ON pt.tag_id = t.id
          WHERE pt.prompt_id IN (${placeholders})
          ORDER BY t.name`,
    args: promptIds,
  });

  const tagRows = tagsResult.rows as unknown as Array<{
    prompt_id: number; tag_id: number; tag_name: string;
  }>;

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
export async function getAllTags(): Promise<Tag[]> {
  await initSchema();
  const result = await getDb().execute('SELECT id, name FROM tags ORDER BY name');
  return result.rows as unknown as Tag[];
}


