'use client';

import AgentCard from './AgentCard';
import { AGENT_ORDER } from '@/lib/constants';

export default function RecoveryDashboard({ outputs, onExpand, onRetry }) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--hairline)' }}>
      <div
        className="flex items-center gap-4 px-4 py-2.5 font-mono text-[11px] tracking-wide"
        style={{ background: 'var(--board)', color: 'var(--ink-faint)', borderBottom: '1px solid var(--hairline)' }}
      >
        <span className="w-12">CODE</span>
        <span className="w-[18px]" />
        <span className="w-[150px]">AGENT</span>
        <span className="w-[112px]">STATUS</span>
        <span className="flex-1">DETAIL</span>
        <span className="w-[60px]" />
      </div>
      {AGENT_ORDER.map((agentName, index) => (
        <AgentCard
          key={agentName}
          agentName={agentName}
          output={outputs[agentName]}
          index={index}
          onExpand={onExpand}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
}
