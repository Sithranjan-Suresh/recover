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
        className="max-w-[680px] w-full rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
        style={{ background: 'var(--bg-surface)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {AGENT_LABELS[agentName]}
          </h2>
          <button onClick={onClose} className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Close ✕
          </button>
        </div>
        {Content && <Content content={output.content} recoveryContext={recoveryContext} />}
      </div>
    </div>
  );
}
