'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import type { Prompt } from '@/lib/types';

interface Props {
  prompt: Prompt | null;
  onSave: (data: { title: string; body: string; tags: string[] }) => Promise<void>;
  onClose: () => void;
}

export function PromptModal({ prompt, onSave, onClose }: Props) {
  const [title, setTitle] = useState(prompt?.title ?? '');
  const [body, setBody] = useState(prompt?.body ?? '');
  const [tags, setTags] = useState<string[]>(prompt?.tags.map((t) => t.name) ?? []);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  function addTag(raw: string) {
    const name = raw.trim().toLowerCase();
    if (name && !tags.includes(name)) setTags((prev) => [...prev, name]);
    setTagInput('');
  }

  function removeTag(name: string) {
    setTags((prev) => prev.filter((t) => t !== name));
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  async function handleSubmit() {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    try {
      await onSave({ title: title.trim(), body: body.trim(), tags });
    } finally {
      setSaving(false);
    }
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" role="dialog" aria-modal="true">
        <h2 className="modal-title" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          {prompt ? 'Editar prompt' : 'Nuevo prompt'}
        </h2>

        <div className="form-field">
          <label className="form-label">Título</label>
          <input
            className="form-input"
            type="text"
            placeholder="ej. fix/commit-message"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div className="form-field">
          <label className="form-label">Contenido del prompt</label>
          <textarea
            className="form-textarea"
            placeholder="Escribí o pegá tu prompt acá…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label">Tags (Enter o coma para agregar)</label>
          <div
            className="tags-input-wrap"
            onClick={() => tagInputRef.current?.focus()}
          >
            {tags.map((tag) => (
              <span key={tag} className="tag-chip-removable">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} aria-label={`Quitar ${tag}`}>
                  ×
                </button>
              </span>
            ))}
            <input
              ref={tagInputRef}
              className="tags-text-input"
              type="text"
              placeholder={tags.length === 0 ? 'git, copilot, review…' : ''}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button
            className="btn btn-accent"
            onClick={handleSubmit}
            disabled={saving || !title.trim() || !body.trim()}
          >
            {saving ? 'Guardando…' : prompt ? 'Guardar cambios' : 'Crear prompt'}
          </button>
        </div>
      </div>
    </div>
  );
}
