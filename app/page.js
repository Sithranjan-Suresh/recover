import InputForm from '@/components/InputForm';

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl mx-auto mb-10 text-center">
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          Recover
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Five agents. One sentence. Your recovery starts now.
        </p>
      </div>
      <InputForm />
    </main>
  );
}
