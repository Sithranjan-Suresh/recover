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

function Section({ code, title, actions, checked, onToggle, last }) {
  if (!actions || actions.length === 0) return null;
  return (
    <div
      className={`min-w-0 px-6 py-5 ${last ? '' : 'border-b sm:border-b-0 sm:border-r'}`}
      style={{ borderColor: 'var(--hairline)', borderStyle: 'dashed' }}
    >
      <div className="flex items-baseline gap-2 mb-3">
        <span className="font-mono text-[10px] tracking-wide" style={{ color: 'var(--ink-faint)' }}>
          {code}
        </span>
        <h3 className="font-display text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--ink)' }}>
          {title}
        </h3>
      </div>
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
                <span style={{ color: 'var(--amber)', flexShrink: 0, marginTop: 2 }}>
                  <AgentIcon agentName={action.sourceAgent} size={14} />
                </span>
              )}
              <span
                className="text-sm flex-1 min-w-0 break-words"
                style={{
                  color: isChecked ? 'var(--ink-muted)' : 'var(--ink)',
                  textDecoration: isChecked ? 'line-through' : 'none',
                  overflowWrap: 'anywhere',
                  fontFamily: 'var(--font-source-serif)',
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

  const sections = [
    { code: 'I-1', title: 'Day 1', actions: day1 },
    { code: 'I-2', title: 'Week 1', actions: week1 },
    { code: 'I-3', title: 'Month 1', actions: month1 },
  ].filter((s) => s.actions.length > 0);

  return (
    <div className="fade-in mt-10 rounded-lg max-w-full overflow-hidden" style={{ background: 'var(--row)', border: '1px solid var(--hairline)' }}>
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--hairline)' }}>
        <p className="font-mono text-[10px] tracking-widest mb-1" style={{ color: 'var(--ink-faint)' }}>
          ITINERARY · SYNTHESIZED FROM ALL 5 AGENTS
        </p>
        <h2 className="font-display text-xl font-bold" style={{ color: 'var(--ink)' }}>
          Your Recovery Plan
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 min-w-0">
        {sections.map((s, i) => (
          <Section
            key={s.title}
            code={s.code}
            title={s.title}
            actions={s.actions}
            checked={checked}
            onToggle={toggle}
            last={i === sections.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
