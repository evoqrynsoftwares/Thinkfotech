/* Shown while a page's code is still loading. Same layout as a real page header + cards. */
export default function PageFallback() {
  return (
    <div role="status" aria-label="Loading page" className="animate-pulse motion-reduce:animate-none">
      <div className="h-10 w-56 rounded-full bg-white" />
      <div className="mt-3 h-4 w-80 max-w-full rounded-full bg-white/70" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-44 rounded-3xl bg-card" />
        ))}
      </div>
    </div>
  );
}
