'use client';

import { useState } from 'react';
import CopyButton from './CopyButton';
import StateSelector from './StateSelector';
import Spinner from './Spinner';
import { US_STATES } from '@/lib/constants';
import { callAgent } from '@/lib/agents';

export default function UnemploymentExpanded({ content, recoveryContext }) {
  const [resolved, setResolved] = useState(content);
  const [loading, setLoading] = useState(false);

  if (!resolved) return null;

  if (resolved.nonUS) {
    return (
      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
        Unemployment guidance varies by country. Please check your local government employment services.
      </p>
    );
  }

  const handleStateSelect = (code) => {
    const stateName = Object.entries(US_STATES).find(([, c]) => c === code)?.[0];
    setLoading(true);
    callAgent('unemploymentAgent', { ...recoveryContext, inferredState: code, jobTitle: recoveryContext.jobTitle })
      .then(({ content: newContent }) => setResolved({ ...newContent, state: code, stateName }))
      .finally(() => setLoading(false));
  };

  if (resolved.needsStateSelection) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
          Select your state to get specific guidance
        </p>
        <StateSelector value="" onChange={handleStateSelect} disabled={loading} />
        {loading && (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Spinner size={14} /> Loading state guidance...
          </div>
        )}
      </div>
    );
  }

  const checklistText = resolved.checklist.map((c, i) => `${i + 1}. ${c}`).join('\n');

  return (
    <div className="flex flex-col gap-4">
      <p className="font-display text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
        {resolved.stateName}
      </p>
      {resolved.filingUrl && (
        <a
          href={resolved.filingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium"
          style={{ color: 'var(--accent)' }}
        >
          File online →
        </a>
      )}
      <ol className="list-decimal list-inside text-sm flex flex-col gap-1.5" style={{ color: 'var(--text-primary)' }}>
        {resolved.checklist.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {resolved.weeklyBenefitRange}
      </p>
      <CopyButton text={checklistText} label="Copy checklist" />
    </div>
  );
}
