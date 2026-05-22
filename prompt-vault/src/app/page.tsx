import { getAllPrompts, getAllTags } from '@/lib/queries';
import { PromptVaultClient } from '@/components/PromptVaultClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [prompts, tags] = await Promise.all([getAllPrompts(), getAllTags()]);
  return <PromptVaultClient initialPrompts={prompts} allTags={tags} />;
}
