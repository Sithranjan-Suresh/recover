'use client';

import { useEffect, useState } from 'react';
import AgentIcon from './AgentIcon';
import { AGENT_ORDER, AGENT_LABELS } from '@/lib/constants';

export default function DemoIntro({ onComplete }) {
  const [textVisible, setTextVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (sessionStorage.getItem('introSeen') || prefersReduced) {
      sessionStorage.setItem('introSeen', '1');
      onComplete();
      return;
    }

    const textTimer = setTimeout(() => setTextVisible(true), AGENT_ORDER.length * 50 + 200);
    const fadeTimer = setTimeout(() => setFadingOut(true), 2700);
    const doneTimer = setTimeout(() => {
      sessionStorage.setItem('introSeen', '1');
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    sessionStorage.setItem('introSeen', '1');
    onComplete();
  };

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ${
        fadingOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ background: 'var(--bg-base)', zIndex: 200 }}
    >
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        Skip →
      </button>

      <div className="flex gap-6 mb-8">
        {AGENT_ORDER.map((agentName, i) => (
          <div
            key={agentName}
            className="agent-card flex flex-col items-center gap-2"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--accent-border)',
                color: 'var(--accent)',
              }}
            >
              <AgentIcon agentName={agentName} size={26} />
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {AGENT_LABELS[agentName]}
            </span>
          </div>
        ))}
      </div>

      <p
        className={`font-display text-lg sm:text-xl font-medium text-center px-6 transition-opacity duration-300 ${
          textVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ color: 'var(--text-primary)' }}
      >
        Five agents. One sentence. Your recovery starts now.
      </p>
    </div>
  );
}
