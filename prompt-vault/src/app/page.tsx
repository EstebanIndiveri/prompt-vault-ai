import { getAllPrompts, getAllTags } from '@/lib/queries';
import { PromptVaultClient } from '@/components/PromptVaultClient';

export const dynamic = 'force-dynamic';

export default function Home() {
  const prompts = getAllPrompts();
  const tags = getAllTags();

  return <PromptVaultClient initialPrompts={prompts} allTags={tags} />;
}
