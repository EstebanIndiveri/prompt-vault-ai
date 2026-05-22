'use client';

import { useState, useMemo, useTransition, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Prompt, Tag } from '@/lib/types';
import { createPrompt, updatePrompt, deletePrompt } from '@/lib/actions';
import { PromptCard } from './PromptCard';
import { PromptModal } from './PromptModal';

interface Props {
  initialPrompts: Prompt[];
  allTags: Tag[];
}

export function PromptVaultClient({ initialPrompts, allTags }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2100);
  }, []);

  const filtered = useMemo(() => {
    let list = initialPrompts;
    if (activeTag) {
      list = list.filter((p) => p.tags.some((t) => t.name === activeTag));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q) ||
          p.tags.some((t) => t.name.includes(q))
      );
    }
    return list;
  }, [initialPrompts, activeTag, search]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of initialPrompts) {
      for (const t of p.tags) {
        counts[t.name] = (counts[t.name] ?? 0) + 1;
      }
    }
    return counts;
  }, [initialPrompts]);

  function openCreate() {
    setEditingPrompt(null);
    setModalOpen(true);
  }

  function openEdit(prompt: Prompt) {
    setEditingPrompt(prompt);
    setModalOpen(true);
  }

  async function handleSave(data: { title: string; body: string; tags: string[] }) {
    try {
      if (editingPrompt) {
        await updatePrompt(editingPrompt.id, data);
        showToast('Prompt actualizado');
      } else {
        await createPrompt(data);
        showToast('Prompt guardado');
      }
      setModalOpen(false);
      startTransition(() => router.refresh());
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al guardar el prompt');
    }
  }

  async function handleDelete(id: number) {
    try {
      await deletePrompt(id);
      showToast('Prompt eliminado');
      startTransition(() => router.refresh());
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al eliminar el prompt');
    }
  }

  const headingLabel =
    activeTag ? `#${activeTag}` : search ? `Resultados para "${search}"` : 'Todos los prompts';

  return (
    <div className="vault-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="wordmark" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            Prompt Vault
          </span>
          <span className="tagline">tu biblioteca de prompts</span>
        </div>

        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Buscar prompts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="sidebar-tags">
          <span className="sidebar-tags-label">Categorías</span>

          <button
            className={`tag-item ${activeTag === null ? 'active' : ''}`}
            onClick={() => setActiveTag(null)}
          >
            <span>Todo</span>
            <span className="count">{initialPrompts.length}</span>
          </button>

          {allTags.map((tag) => (
            <button
              key={tag.id}
              className={`tag-item ${activeTag === tag.name ? 'active' : ''}`}
              onClick={() => setActiveTag(activeTag === tag.name ? null : tag.name)}
            >
              <span>{tag.name}</span>
              <span className="count">{tagCounts[tag.name] ?? 0}</span>
            </button>
          ))}
        </div>

        <button className="sidebar-new-btn" onClick={openCreate}>
          + Nuevo prompt
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="main" style={{ opacity: isPending ? 0.7 : 1, transition: 'opacity 0.2s' }}>
        <div className="main-header">
          <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>{headingLabel}</h1>
          <span className="result-count">
            {filtered.length} {filtered.length === 1 ? 'prompt' : 'prompts'}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="glyph">✦</div>
            <p>
              {search || activeTag
                ? 'No hay prompts que coincidan con tu búsqueda.'
                : 'Tu vault está vacío.\nCreá tu primer prompt con el botón de la izquierda.'}
            </p>
          </div>
        ) : (
          <div className="prompt-list">
            {filtered.map((p) => (
              <PromptCard
                key={p.id}
                prompt={p}
                onEdit={() => openEdit(p)}
                onDelete={() => handleDelete(p.id)}
                onCopy={() => showToast('Copiado al portapapeles ✓')}
                onCopyError={() => showToast('No se pudo copiar al portapapeles')}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Modal ── */}
      {modalOpen && (
        <PromptModal
          prompt={editingPrompt}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* ── Toast ── */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

