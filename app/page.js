'use client';

import { useEffect, useState } from 'react';
import InputForm from '@/components/InputForm';
import DemoIntro from '@/components/DemoIntro';

export default function Home() {
  const [showIntro, setShowIntro] = useState(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const introSeen = sessionStorage.getItem('introSeen');
    setShowIntro(!introSeen && !prefersReduced);
  }, []);

  if (showIntro === null) return null;

  if (showIntro) {
    return <DemoIntro onComplete={() => setShowIntro(false)} />;
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 fade-in">
      <div className="w-full max-w-xl mx-auto mb-10 text-center">
        <p className="font-mono text-[11px] tracking-widest mb-3" style={{ color: 'var(--ink-faint)' }}>
          RECOVER · DEPARTURES
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold mb-3" style={{ color: 'var(--ink)' }}>
          Recover
        </h1>
        <p style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-source-serif)' }}>
          Five agents. One sentence. Your recovery starts now.
        </p>
      </div>
      <InputForm />
    </main>
  );
}
