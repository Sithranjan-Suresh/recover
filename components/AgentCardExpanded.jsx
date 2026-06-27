'use client';

import LinkedInExpanded from './LinkedInExpanded';
import OutreachExpanded from './OutreachExpanded';
import UnemploymentExpanded from './UnemploymentExpanded';
import JobAlertsExpanded from './JobAlertsExpanded';
import ResumeExpanded from './ResumeExpanded';
import { AGENT_LABELS } from '@/lib/constants';

const EXPANDED_COMPONENTS = {
  linkedinAgent: LinkedInExpanded,
  outreachAgent: OutreachExpanded,
  unemploymentAgent: UnemploymentExpanded,
  jobAlertsAgent: JobAlertsExpanded,
  resumeAgent: ResumeExpanded,
};

export default function AgentCardExpanded({ agentName, output, recoveryContext, onClose }) {
  const Content = EXPANDED_COMPONENTS[agentName];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 flex items-center justify-center p-6 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.7)', zIndex: 100 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-[680px] w-full rounded-lg p-6 max-h-[85vh] overflow-y-auto"
        style={{ background: 'var(--row)', border: '1px solid var(--hairline)' }}
      >
        <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid var(--hairline)' }}>
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-lg font-bold" style={{ color: 'var(--ink)' }}>
              {AGENT_LABELS[agentName]}
            </h2>
            <span
              className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ color: 'var(--amber)', background: 'var(--amber-dim)', border: '1px solid var(--amber-border)' }}
            >
              ASI:ONE · asi1-mini
            </span>
          </div>
          <button onClick={onClose} className="font-mono text-xs" style={{ color: 'var(--ink-muted)' }}>
            CLOSE ✕
          </button>
        </div>
        {Content && <Content content={output.content} recoveryContext={recoveryContext} />}
      </div>
    </div>
  );
}
