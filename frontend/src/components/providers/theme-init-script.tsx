/** Runs before paint so light/dark + accent match persisted preference (no flash). */
export function ThemeInitScript() {
  const script = `(function(){try{var r=document.documentElement;var p=JSON.parse(localStorage.getItem('evoke-theme')||'{}');var s=p.state||{};if(s.mode)r.setAttribute('data-theme',s.mode);if(s.accent)r.setAttribute('data-accent',s.accent);}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
