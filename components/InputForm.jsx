'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_PERSONA } from '@/lib/constants';
import { extractRecoveryContext } from '@/lib/context';

const fieldStyle = {
  background: 'var(--row)',
  border: '1px solid var(--hairline)',
  color: 'var(--ink)',
};

function FieldLabel({ code, children }) {
  return (
    <label className="flex items-baseline gap-2 mb-1.5">
      <span className="font-mono text-[10px] tracking-wide" style={{ color: 'var(--ink-faint)' }}>
        {code}
      </span>
      <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
        {children}
      </span>
    </label>
  );
}

export default function InputForm() {
  const router = useRouter();
  const [rawInput, setRawInput] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [topSkills, setTopSkills] = useState('');
  const [optionalContext, setOptionalContext] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [linkedinNotice, setLinkedinNotice] = useState(null);

  const jobTitleRef = useRef(null);
  const topSkillsRef = useRef(null);
  const optionalRef = useRef(null);
  const linkedinRef = useRef(null);

  const canSubmit =
    rawInput.trim().length >= 10 && jobTitle.trim().length > 0 && topSkills.trim().length > 0;

  const fillDemo = () => {
    setRawInput(DEMO_PERSONA.rawInput);
    setJobTitle(DEMO_PERSONA.jobTitle);
    setTopSkills(DEMO_PERSONA.topSkills);
    setOptionalContext(DEMO_PERSONA.optionalContext);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    let mergedOptionalContext = optionalContext;

    if (linkedinUrl.trim()) {
      setSubmitting(true);
      setLinkedinNotice('Analyzing your LinkedIn profile...');
      try {
        const res = await fetch('/api/linkedin-fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: linkedinUrl.trim() }),
        });
        const data = await res.json();
        if (!data.blocked && data.text) {
          mergedOptionalContext = [optionalContext, `LinkedIn profile content:\n${data.text}`]
            .filter(Boolean)
            .join('\n\n');
          setLinkedinNotice('LinkedIn profile analyzed and added to your context.');
        } else {
          setLinkedinNotice(
            "LinkedIn blocks automated access to profiles, so we couldn't pull this one in — your other answers are still used."
          );
        }
      } catch {
        setLinkedinNotice("Couldn't reach that LinkedIn URL — continuing with your other answers.");
      }
      setSubmitting(false);
      await new Promise((resolve) => setTimeout(resolve, 900));
    }

    const context = extractRecoveryContext(rawInput, jobTitle, topSkills, mergedOptionalContext);
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
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl mx-auto flex flex-col gap-5 p-6 rounded-lg"
      style={{ background: 'var(--board)', border: '1px solid var(--hairline)' }}
    >
      <div className="flex items-center justify-between font-mono text-[10px] tracking-wide pb-3" style={{ color: 'var(--ink-faint)', borderBottom: '1px solid var(--hairline)' }}>
        <span>MANIFEST INTAKE</span>
        <span>5 FIELDS</span>
      </div>

      <div>
        <FieldLabel code="F-1">What happened?</FieldLabel>
        <textarea
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value.slice(0, 500))}
          placeholder="e.g. I just got laid off from [Company] as a [Title]"
          maxLength={500}
          rows={3}
          required
          className="w-full rounded-md px-3 py-2 text-sm resize-none"
          style={fieldStyle}
        />
      </div>

      <div>
        <FieldLabel code="F-2">Your job title</FieldLabel>
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
          style={fieldStyle}
        />
      </div>

      <div>
        <FieldLabel code="F-3">Your top 3 skills</FieldLabel>
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
          style={fieldStyle}
        />
      </div>

      <div>
        <FieldLabel code="F-4">
          Current LinkedIn headline and/or resume bullets{' '}
          <span style={{ color: 'var(--ink-muted)', fontWeight: 400 }}>(optional)</span>
        </FieldLabel>
        <textarea
          ref={optionalRef}
          value={optionalContext}
          onChange={(e) => setOptionalContext(e.target.value.slice(0, 1000))}
          onKeyDown={focusNext(linkedinRef)}
          placeholder="Paste your current LinkedIn headline and/or a few recent resume bullets (optional)"
          maxLength={1000}
          rows={4}
          className="w-full rounded-md px-3 py-2 text-sm resize-none"
          style={fieldStyle}
        />
        <p className="text-xs mt-1.5" style={{ color: 'var(--ink-muted)' }}>
          The more you give us, the less generic your outputs will be.
        </p>
      </div>

      <div>
        <FieldLabel code="F-5">
          Your LinkedIn profile URL <span style={{ color: 'var(--ink-muted)', fontWeight: 400 }}>(optional)</span>
        </FieldLabel>
        <input
          ref={linkedinRef}
          type="url"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          onKeyDown={focusNext(null)}
          placeholder="https://www.linkedin.com/in/your-name"
          className="w-full rounded-md px-3 py-2 text-sm"
          style={fieldStyle}
        />
        <p className="text-xs mt-1.5" style={{ color: 'var(--ink-muted)' }}>
          We&apos;ll try to pull in publicly visible profile text. LinkedIn blocks most automated
          access, so this is best-effort — your other answers always work regardless.
        </p>
      </div>

      {linkedinNotice && (
        <p className="text-xs" style={{ color: 'var(--amber)' }}>
          {linkedinNotice}
        </p>
      )}

      <button
        type="button"
        onClick={fillDemo}
        className="font-mono text-xs font-medium px-4 py-2 rounded-md self-start"
        style={{ color: 'var(--amber)', background: 'var(--amber-dim)', border: '1px solid var(--amber-border)' }}
      >
        TRY A DEMO SCENARIO →
      </button>

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="font-display text-base font-bold px-5 py-3 rounded-md tracking-wide"
        style={{
          background: canSubmit && !submitting ? 'var(--amber)' : 'var(--row)',
          color: canSubmit && !submitting ? '#1B1A17' : 'var(--ink-muted)',
          cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
        }}
      >
        {submitting ? 'ANALYZING...' : 'START RECOVERY →'}
      </button>
    </form>
  );
}
