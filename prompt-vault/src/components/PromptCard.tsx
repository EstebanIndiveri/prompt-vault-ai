'use client';

import { useState, useEffect, useRef } from 'react';
import type { Prompt } from '@/lib/types';

interface Props {
  prompt: Prompt;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onCopyError: () => void;
}

export function PromptCard({ prompt, onEdit, onDelete, onCopy, onCopyError }: Props) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  function handleCopy() {
    navigator.clipboard.writeText(prompt.body).then(() => {
      setCopied(true);
      onCopy();
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      onCopyError();
    });
  }

  const date = new Date(prompt.created_at).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article className="prompt-card">
      <div className="prompt-card-header">
        <h2 className="prompt-card-title">{prompt.title}</h2>

        <div className="prompt-card-actions">
          <button
            className={`card-action-btn copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            title="Copiar prompt"
          >
            {copied ? '✓ Copiado' : 'Copiar'}
          </button>
          <button className="card-action-btn" onClick={onEdit} title="Editar">
            Editar
          </button>
          <button className="card-action-btn danger" onClick={onDelete} title="Eliminar">
            ✕
          </button>
        </div>
      </div>

      <p className="prompt-card-body">{prompt.body}</p>

      <footer className="prompt-card-footer">
        {prompt.tags.map((tag) => (
          <span key={tag.id} className="tag-chip">{tag.name}</span>
        ))}
        <span className="prompt-card-date">{date}</span>
      </footer>
    </article>
  );
}

