'use client';

import { useState } from 'react';
import AgentIcon from './AgentIcon';

function dedupe(actions) {
  const seen = new Set();
  return actions.filter((a) => {
    const key = a.text.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function Section({ title, actions, checked, onToggle }) {
  if (!actions || actions.length === 0) return null;
  return (
    <div className="min-w-0">
      <h3 className="font-display text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <ul className="flex flex-col gap-2.5">
        {actions.map((action, i) => {
          const key = `${title}-${i}`;
          const isChecked = checked.has(key);
          return (
            <li key={key} className="flex items-start gap-2.5 min-w-0">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggle(key)}
                className="mt-0.5 flex-shrink-0"
              />
              {action.sourceAgent && (
                <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}>
                  <AgentIcon agentName={action.sourceAgent} size={14} />
                </span>
              )}
              <span
                className="text-sm flex-1 min-w-0 break-words"
                style={{
                  color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: isChecked ? 'line-through' : 'none',
                  overflowWrap: 'anywhere',
                }}
              >
                {action.text}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function ActionPlan({ plan }) {
  const [checked, setChecked] = useState(new Set());

  if (!plan) return null;

  const toggle = (key) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const day1 = dedupe(plan.day1 || []);
  const week1 = dedupe((plan.week1 || []).filter((a) => !day1.some((d) => d.text.trim().toLowerCase() === a.text.trim().toLowerCase())));
  const month1 = dedupe(
    (plan.month1 || []).filter(
      (a) =>
        !day1.some((d) => d.text.trim().toLowerCase() === a.text.trim().toLowerCase()) &&
        !week1.some((w) => w.text.trim().toLowerCase() === a.text.trim().toLowerCase())
    )
  );

  return (
    <div className="fade-in mt-10 p-6 rounded-xl max-w-full overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}>
      <h2 className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
        Your Recovery Plan
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        Synthesized from all 5 agents
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 min-w-0">
        <Section title="Day 1" actions={day1} checked={checked} onToggle={toggle} />
        <Section title="Week 1" actions={week1} checked={checked} onToggle={toggle} />
        <Section title="Month 1" actions={month1} checked={checked} onToggle={toggle} />
      </div>
    </div>
  );
}
