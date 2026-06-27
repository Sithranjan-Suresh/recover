'use client';

import CopyButton from './CopyButton';

const LABELS = {
  manager: 'To a former manager',
  peer: 'To a peer or colleague',
  recruiter: 'To a recruiter',
};

export default function OutreachExpanded({ content }) {
  if (!content) return null;

  const allText = content.emails
    .map((e) => `${LABELS[e.type]}\nSubject: ${e.subject}\n\n${e.body}`)
    .join('\n\n---\n\n');

  return (
    <div className="flex flex-col gap-5">
      <CopyButton text={allText} label="Copy all 3 emails" />
      {content.emails.map((email) => (
        <div key={email.type} className="pt-4" style={{ borderTop: '1px solid var(--bg-border)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            {LABELS[email.type]}
          </p>
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {email.subject}
          </p>
          <p className="text-sm mb-3 whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {email.body}
          </p>
          <CopyButton text={`Subject: ${email.subject}\n\n${email.body}`} label="Copy email" />
        </div>
      ))}
    </div>
  );
}
