'use client';

import { US_STATES } from '@/lib/constants';

export default function StateSelector({ value, onChange, disabled = false }) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded-md px-3 py-2 text-sm"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--bg-border)',
        color: 'var(--text-primary)',
      }}
    >
      <option value="" disabled>
        Select your state...
      </option>
      {Object.entries(US_STATES).map(([name, code]) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  );
}
