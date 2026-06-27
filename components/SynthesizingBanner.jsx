'use client';

import AgentIcon from './AgentIcon';
import { AGENT_ORDER } from '@/lib/constants';

export default function SynthesizingBanner() {
  return (
    <div
      className="fade-in mt-10 p-6 rounded-lg flex flex-col items-center gap-4"
      style={{ background: 'var(--row)', border: '1px solid var(--amber-border)' }}
    >
      <p className="font-mono text-[10px] tracking-widest" style={{ color: 'var(--ink-faint)' }}>
        COMPILING ITINERARY
      </p>
      <div className="flex gap-4">
        {AGENT_ORDER.map((agentName, i) => (
          <div
            key={agentName}
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              color: 'var(--amber)',
              background: 'var(--amber-dim)',
              border: '1px solid var(--amber-border)',
              animation: `synthPulse 1.2s ease-in-out ${i * 0.18}s infinite`,
            }}
          >
            <AgentIcon agentName={agentName} size={18} />
          </div>
        ))}
      </div>
      <p className="text-sm font-display font-medium" style={{ color: 'var(--ink)' }}>
        Synthesizing your recovery plan from all 5 agents...
      </p>
      <style>{`
        @keyframes synthPulse {
          0%, 100% { opacity: 0.35; transform: scale(0.92); }
          50% { opacity: 1; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
