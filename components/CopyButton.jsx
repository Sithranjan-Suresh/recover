'use client';

import { useState } from 'react';

export default function CopyButton({ text, label = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${className}`}
      style={{
        borderColor: copied ? 'var(--success-border)' : 'var(--accent-border)',
        color: copied ? 'var(--success)' : 'var(--accent)',
        background: copied ? 'var(--success-dim)' : 'var(--accent-dim)',
      }}
    >
      {copied ? 'Copied!' : label}
    </button>
  );
}
