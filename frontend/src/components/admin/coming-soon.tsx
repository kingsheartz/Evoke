export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-app-text">{title}</h1>
      <p className="mt-2 text-app-muted">This section is coming soon.</p>
    </div>
  );
}
