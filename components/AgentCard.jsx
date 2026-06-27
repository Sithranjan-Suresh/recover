'use client';

import { useEffect, useState } from 'react';
import AgentIcon from './AgentIcon';
import Spinner from './Spinner';
import { AGENT_LABELS, AGENT_NAMES } from '@/lib/constants';

const STATUS_FLAP = {
  queued: { label: 'QUEUED', color: 'var(--ink-muted)', bg: 'transparent', border: 'var(--hairline)' },
  awaiting: { label: 'AWAITING', color: 'var(--ink-muted)', bg: 'transparent', border: 'var(--hairline)' },
  running: { label: 'IN PROGRESS', color: 'var(--amber)', bg: 'var(--amber-dim)', border: 'var(--amber-border)' },
  complete: { label: 'READY', color: 'var(--sage)', bg: 'var(--sage-dim)', border: 'var(--sage-border)' },
  error: { label: 'DELAYED', color: 'var(--terracotta)', bg: 'var(--terracotta-dim)', border: 'var(--terracotta-border)' },
};

function codeFor(agentName) {
  return `R-0${AGENT_NAMES.indexOf(agentName) + 1}`;
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

  const isWaiting = output.status === 'queued' && output.waitingOn;
  const flapKey = isWaiting ? 'awaiting' : output.status;
  const flap = STATUS_FLAP[flapKey] || STATUS_FLAP.queued;
  const code = codeFor(agentName);

  return (
    <div
      className="board-row flex items-center gap-4 px-4 py-3.5"
      style={{
        background: 'var(--row)',
        borderBottom: '1px solid var(--hairline)',
        animationDelay: `${index * 50}ms`,
      }}
    >
      <span className="font-mono text-xs flex-shrink-0 w-12" style={{ color: 'var(--ink-faint)' }}>
        {code}
      </span>

      <span className="flex-shrink-0" style={{ color: 'var(--ink-muted)' }}>
        <AgentIcon agentName={agentName} size={18} />
      </span>

      <span
        className="font-display text-base font-semibold flex-shrink-0 w-[150px] truncate"
        style={{ color: 'var(--ink)' }}
      >
        {AGENT_LABELS[agentName]}
      </span>

      <span
        key={flapKey}
        className="flap flap-flip font-mono text-[11px] font-medium tracking-wide px-2.5 py-1 rounded flex-shrink-0 w-[112px] text-center"
        style={{ color: flap.color, background: flap.bg, border: `1px solid ${flap.border}` }}
      >
        {output.status === 'running' ? <Spinner size={11} /> : flap.label}
      </span>

      <span className="flex-1 min-w-0 text-sm truncate italic" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-source-serif)' }}>
        {output.status === 'queued' &&
          (isWaiting ? `Waiting on ${codeFor(output.waitingOn)} · ${AGENT_LABELS[output.waitingOn]} to finish first...` : 'Waiting in the queue...')}
        {output.status === 'running' &&
          (output.streamPreview
            ? output.streamPreview.slice(0, 140)
            : `Working${elapsed > 0 ? ` · ${elapsed}s` : ''}`)}
        {output.status === 'complete' && output.preview}
        {output.status === 'error' && (output.error || 'Something went wrong.')}
      </span>

      {output.status === 'complete' && (
        <button
          onClick={() => onExpand(agentName)}
          className="font-mono text-xs font-medium flex-shrink-0 whitespace-nowrap"
          style={{ color: 'var(--amber)' }}
        >
          OPEN →
        </button>
      )}

      {output.status === 'error' && (
        <button
          onClick={() => onRetry(agentName)}
          className="font-mono text-xs font-medium px-2.5 py-1 rounded flex-shrink-0"
          style={{ color: 'var(--terracotta)', background: 'var(--terracotta-dim)', border: '1px solid var(--terracotta-border)' }}
        >
          RETRY
        </button>
      )}
    </div>
  );
}
