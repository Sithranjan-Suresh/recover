'use client';

import { useEffect, useState } from 'react';
import InputForm from '@/components/InputForm';
import DemoIntro from '@/components/DemoIntro';

export default function Home() {
  const [showIntro, setShowIntro] = useState(null);
  const [started, setStarted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(prefersReduced);
    const introSeen = sessionStorage.getItem('introSeen');
    setShowIntro(!introSeen && !prefersReduced);
  }, []);

  if (showIntro === null) return null;

  if (showIntro) {
    return <DemoIntro onComplete={() => setShowIntro(false)} />;
  }

  const transitionDuration = reducedMotion ? '0ms' : '700ms';
  const fadeDuration = reducedMotion ? '0ms' : '450ms';

  return (
    <main className="flex flex-1 flex-col items-center px-6 overflow-hidden">
      <div
        style={{
          height: started ? '56px' : '18vh',
          transition: `height ${transitionDuration} ease-in-out`,
          flexShrink: 0,
        }}
      />

      <div className="w-full max-w-2xl mx-auto text-center" style={{ flexShrink: 0 }}>
        <p
          className="font-mono tracking-widest mb-4"
          style={{
            color: 'var(--ink-faint)',
            fontSize: started ? '11px' : '13px',
            transition: `font-size ${transitionDuration} ease-in-out`,
          }}
        >
          RECOVER · DEPARTURES
        </p>
        <h1
          className="font-display font-extrabold mb-4"
          style={{
            color: 'var(--ink)',
            fontSize: started ? 'clamp(1.75rem, 4vw, 3rem)' : 'clamp(3.5rem, 10vw, 7rem)',
            lineHeight: 1,
            transition: `font-size ${transitionDuration} ease-in-out`,
          }}
        >
          Recover
        </h1>
        <p
          style={{
            color: 'var(--ink-muted)',
            fontFamily: 'var(--font-source-serif)',
            fontSize: started ? '1rem' : '1.375rem',
            transition: `font-size ${transitionDuration} ease-in-out`,
          }}
        >
          Five agents. One sentence. Your recovery starts now.
        </p>

        <div
          style={{
            maxHeight: started ? 0 : 120,
            opacity: started ? 0 : 1,
            overflow: 'hidden',
            transition: `max-height ${transitionDuration} ease-in-out, opacity ${fadeDuration} ease-in-out`,
          }}
        >
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="font-display text-base font-bold px-6 py-3 rounded-md tracking-wide mt-8"
            style={{ background: 'var(--amber)', color: '#1B1A17' }}
          >
            GET STARTED →
          </button>
        </div>
      </div>

      <div
        className="w-full flex justify-center pb-16 pt-8"
        style={{
          opacity: started ? 1 : 0,
          transition: `opacity ${fadeDuration} ease-in-out ${reducedMotion ? '0ms' : '350ms'}`,
          pointerEvents: started ? 'auto' : 'none',
        }}
      >
        {started && <InputForm />}
      </div>
    </main>
  );
}
