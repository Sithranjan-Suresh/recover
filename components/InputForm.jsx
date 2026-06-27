'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_PERSONA } from '@/lib/constants';
import { extractRecoveryContext } from '@/lib/context';

export default function InputForm() {
  const router = useRouter();
  const [rawInput, setRawInput] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [topSkills, setTopSkills] = useState('');
  const [optionalContext, setOptionalContext] = useState('');

  const jobTitleRef = useRef(null);
  const topSkillsRef = useRef(null);
  const optionalRef = useRef(null);

  const canSubmit =
    rawInput.trim().length >= 10 && jobTitle.trim().length > 0 && topSkills.trim().length > 0;

  const fillDemo = () => {
    setRawInput(DEMO_PERSONA.rawInput);
    setJobTitle(DEMO_PERSONA.jobTitle);
    setTopSkills(DEMO_PERSONA.topSkills);
    setOptionalContext(DEMO_PERSONA.optionalContext);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    const context = extractRecoveryContext(rawInput, jobTitle, topSkills, optionalContext);
    sessionStorage.setItem('recoveryContext', JSON.stringify(context));
    router.push('/dashboard');
  };

  const focusNext = (ref) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (ref) {
        ref.current?.focus();
      } else {
        handleSubmit(e);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto flex flex-col gap-5">
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
          What happened?
        </label>
        <textarea
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value.slice(0, 500))}
          placeholder="e.g. I just got laid off from [Company] as a [Title]"
          maxLength={500}
          rows={3}
          required
          className="w-full rounded-md px-3 py-2 text-sm resize-none"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', color: 'var(--text-primary)' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
          Your job title
        </label>
        <input
          ref={jobTitleRef}
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value.slice(0, 100))}
          onKeyDown={focusNext(topSkillsRef)}
          placeholder="e.g. Senior Product Manager"
          maxLength={100}
          required
          className="w-full rounded-md px-3 py-2 text-sm"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', color: 'var(--text-primary)' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
          Your top 3 skills
        </label>
        <input
          ref={topSkillsRef}
          type="text"
          value={topSkills}
          onChange={(e) => setTopSkills(e.target.value.slice(0, 200))}
          onKeyDown={focusNext(optionalRef)}
          placeholder="e.g. product strategy, fintech, stakeholder management"
          maxLength={200}
          required
          className="w-full rounded-md px-3 py-2 text-sm"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', color: 'var(--text-primary)' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
          Current LinkedIn headline and/or resume bullets{' '}
          <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
        </label>
        <textarea
          ref={optionalRef}
          value={optionalContext}
          onChange={(e) => setOptionalContext(e.target.value.slice(0, 1000))}
          placeholder="Paste your current LinkedIn headline and/or a few recent resume bullets (optional)"
          maxLength={1000}
          rows={4}
          className="w-full rounded-md px-3 py-2 text-sm resize-none"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', color: 'var(--text-primary)' }}
        />
        <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
          The more you give us, the less generic your outputs will be.
        </p>
      </div>

      <button
        type="button"
        onClick={fillDemo}
        className="text-sm font-medium px-4 py-2 rounded-md self-start"
        style={{ color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}
      >
        Try a demo scenario →
      </button>

      <button
        type="submit"
        disabled={!canSubmit}
        className="text-sm font-semibold px-5 py-3 rounded-md font-display"
        style={{
          background: canSubmit ? 'var(--accent)' : 'var(--bg-elevated)',
          color: canSubmit ? '#04111A' : 'var(--text-muted)',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
        }}
      >
        Start Recovery
      </button>
    </form>
  );
}
