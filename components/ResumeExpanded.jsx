'use client';

import CopyButton from './CopyButton';

export default function ResumeExpanded({ content }) {
  if (!content) return null;

  const { priorities } = content;
  const allText = priorities
    .map((p, i) => `${i + 1}. ${p.summary}\n${p.explanation}${p.specificReference ? `\n${p.specificReference}` : ''}`)
    .join('\n\n');

  return (
    <div className="flex flex-col gap-5">
      <CopyButton text={allText} label="Copy all 3 priorities" />
      {priorities.map((p, i) => (
        <div key={i} className="pt-4" style={{ borderTop: i > 0 ? '1px solid var(--bg-border)' : 'none' }}>
          <p className="text-sm font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
            {i + 1}. {p.summary}
          </p>
          <p className="text-sm mb-2 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {p.explanation}
          </p>
          {p.specificReference ? (
            <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
              {p.specificReference}
            </p>
          ) : (
            <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
              Paste your resume bullets above for specific suggestions.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
