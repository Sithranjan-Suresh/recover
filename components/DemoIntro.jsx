'use client';

import { useEffect, useState } from 'react';
import AgentIcon from './AgentIcon';
import { AGENT_ORDER, AGENT_LABELS } from '@/lib/constants';

export default function DemoIntro({ onComplete }) {
  const [revealedCount, setRevealedCount] = useState(0);
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

    const revealTimers = AGENT_ORDER.map((_, i) =>
      setTimeout(() => setRevealedCount(i + 1), 150 + i * 180)
    );
    const textTimer = setTimeout(() => setTextVisible(true), 150 + AGENT_ORDER.length * 180 + 150);
    const fadeTimer = setTimeout(() => setFadingOut(true), 2700);
    const doneTimer = setTimeout(() => {
      sessionStorage.setItem('introSeen', '1');
      onComplete();
    }, 3000);

    return () => {
      revealTimers.forEach(clearTimeout);
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
      style={{ background: 'var(--board)', zIndex: 200 }}
    >
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 font-mono text-xs"
        style={{ color: 'var(--ink-muted)' }}
      >
        SKIP →
      </button>

      <div className="font-mono text-[11px] tracking-widest mb-3" style={{ color: 'var(--ink-faint)' }}>
        RECOVER · DEPARTURES
      </div>

      <div className="flex flex-col gap-0 rounded-lg overflow-hidden mb-8" style={{ border: '1px solid var(--hairline)' }}>
        {AGENT_ORDER.map((agentName, i) => {
          const revealed = i < revealedCount;
          return (
            <div
              key={agentName}
              className="flex items-center gap-4 px-5 py-2.5"
              style={{ background: 'var(--row)', borderBottom: i < AGENT_ORDER.length - 1 ? '1px solid var(--hairline)' : 'none' }}
            >
              <span className="font-mono text-xs w-10" style={{ color: 'var(--ink-faint)' }}>
                R-0{i + 1}
              </span>
              <span style={{ color: revealed ? 'var(--amber)' : 'var(--ink-faint)' }}>
                <AgentIcon agentName={agentName} size={16} />
              </span>
              <span
                key={revealed ? 'on' : 'off'}
                className="flap flap-flip font-display text-sm font-semibold w-[180px]"
                style={{ color: revealed ? 'var(--ink)' : 'var(--ink-faint)' }}
              >
                {revealed ? AGENT_LABELS[agentName] : '— — — — —'}
              </span>
              <span
                className="font-mono text-[10px] tracking-wide ml-auto"
                style={{ color: revealed ? 'var(--sage)' : 'var(--ink-faint)' }}
              >
                {revealed ? 'DISPATCHED' : ''}
              </span>
            </div>
          );
        })}
      </div>

      <p
        className={`font-display text-lg sm:text-xl font-semibold text-center px-6 transition-opacity duration-300 ${
          textVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ color: 'var(--ink)' }}
      >
        Five agents. One sentence. Your recovery starts now.
      </p>
    </div>
  );
}
