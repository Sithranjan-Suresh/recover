'use client';

import { useEffect, useState } from 'react';
import AgentIcon from './AgentIcon';
import Spinner from './Spinner';
import { AGENT_LABELS } from '@/lib/constants';

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--text-muted)' }}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="check-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--success)' }}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--danger)' }}>
      <path d="M12 4 2.5 20h19L12 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 10v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function AgentCard({ agentName, output, index = 0, onExpand, onRetry }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (output.status !== 'running') {
      setElapsed(0);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [output.status]);

  const baseStyle = {
    background: 'var(--bg-surface)',
    borderRadius: 12,
    padding: 16,
    animationDelay: `${index * 50}ms`,
  };

  const borderStyle =
    output.status === 'complete'
      ? { borderLeft: '3px solid var(--success)', borderTop: '1px solid var(--bg-border)', borderRight: '1px solid var(--bg-border)', borderBottom: '1px solid var(--bg-border)' }
      : output.status === 'error'
      ? { borderLeft: '3px solid var(--danger)', borderTop: '1px solid var(--bg-border)', borderRight: '1px solid var(--bg-border)', borderBottom: '1px solid var(--bg-border)' }
      : output.status === 'running'
      ? { border: '1px solid var(--accent-border)' }
      : { border: '1px solid var(--bg-border)' };

  return (
    <div className="agent-card" style={{ ...baseStyle, ...borderStyle }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <AgentIcon agentName={agentName} size={18} />
          <span className="font-display text-sm font-medium">{AGENT_LABELS[agentName]}</span>
        </div>
        {output.status === 'queued' && <ClockIcon />}
        {output.status === 'running' && <Spinner size={16} />}
        {output.status === 'complete' && <CheckIcon />}
        {output.status === 'error' && <WarningIcon />}
      </div>

      {output.status === 'queued' && (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Starting...
        </p>
      )}

      {output.status === 'running' && (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Working... {elapsed > 0 ? `${elapsed}s` : ''}
        </p>
      )}

      {output.status === 'complete' && (
        <>
          <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
            {output.preview}
          </p>
          <button
            onClick={() => onExpand(agentName)}
            className="text-sm font-medium"
            style={{ color: 'var(--accent)' }}
          >
            Expand →
          </button>
        </>
      )}

      {output.status === 'error' && (
        <>
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            {output.error || 'Something went wrong.'}
          </p>
          <button
            onClick={() => onRetry(agentName)}
            className="text-sm font-medium px-3 py-1.5 rounded-md"
            style={{ color: 'var(--danger)', background: 'var(--danger-dim)' }}
          >
            Retry
          </button>
        </>
      )}
    </div>
  );
}
