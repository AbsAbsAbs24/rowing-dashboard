function LoadingPanel() {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-surface/90 p-5 shadow-glow">
      <div className="mb-5 h-3 w-24 rounded-full bg-white/10" />
      <div className="h-10 w-28 rounded-full bg-white/10" />
      <div className="mt-5 h-24 rounded-2xl bg-white/5" />
    </div>
  );
}

export default function Loading() {
  return (
    <main className="dashboard-shell min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 flex flex-col gap-6 rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="h-3 w-32 rounded-full bg-white/10" />
            <div className="h-12 w-full max-w-2xl rounded-[1rem] bg-white/10" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-72">
            <div className="h-20 rounded-2xl border border-white/[0.08] bg-surface/80" />
            <div className="h-20 rounded-2xl border border-white/[0.08] bg-surface/80" />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="lg:col-span-2">
            <LoadingPanel />
          </div>
          <LoadingPanel />
          <LoadingPanel />
          <LoadingPanel />
          <LoadingPanel />
          <LoadingPanel />
        </section>
      </div>
    </main>
  );
}
