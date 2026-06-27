'use client';

import { useState } from 'react';
import CopyButton from './CopyButton';
import Spinner from './Spinner';
import { callAgent } from '@/lib/agents';

export default function LinkedInExpanded({ content, recoveryContext }) {
  const [refinement, setRefinement] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [regeneratedHeadline, setRegeneratedHeadline] = useState(null);
  const [error, setError] = useState(null);

  if (!content) return null;

  const headline = regeneratedHeadline || content.generatedHeadline;

  const handleRegenerate = () => {
    if (!refinement.trim()) return;
    setRegenerating(true);
    setError(null);
    callAgent('linkedinAgent', recoveryContext, refinement)
      .then(({ content: newContent }) => setRegeneratedHeadline(newContent.generatedHeadline))
      .catch(() => setError('Regeneration failed — try again.'))
      .finally(() => setRegenerating(false));
  };

  return (
    <div className="flex flex-col gap-5">
      {content.beforeHeadline && (
        <div>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            Your current headline
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {content.beforeHeadline}
          </p>
        </div>
      )}

      <div className="pl-3" style={{ borderLeft: '3px solid var(--success)' }}>
        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
          {content.beforeHeadline ? 'Suggested headline' : 'Your new headline'}
        </p>
        <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
          {headline}
        </p>
        <CopyButton text={headline} label="Copy headline" />
      </div>

      <div className="pt-4" style={{ borderTop: '1px solid var(--bg-border)' }}>
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
          Refine this headline
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={refinement}
            onChange={(e) => setRefinement(e.target.value)}
            placeholder="e.g. 'make it more senior-focused'"
            className="flex-1 rounded-md px-3 py-2 text-sm"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', color: 'var(--text-primary)' }}
          />
          <button
            onClick={handleRegenerate}
            disabled={!refinement.trim() || regenerating}
            className="px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
            style={{
              background: refinement.trim() ? 'var(--accent)' : 'var(--bg-elevated)',
              color: refinement.trim() ? '#04111A' : 'var(--text-muted)',
              cursor: refinement.trim() && !regenerating ? 'pointer' : 'not-allowed',
            }}
          >
            {regenerating && <Spinner size={14} />}
            Regenerate
          </button>
        </div>
        {error && (
          <p className="text-sm mt-2" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
