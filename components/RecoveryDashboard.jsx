'use client';

import AgentCard from './AgentCard';
import { AGENT_ORDER } from '@/lib/constants';

export default function RecoveryDashboard({ outputs, onExpand, onRetry }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
