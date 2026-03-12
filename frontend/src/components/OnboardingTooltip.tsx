import { useState, useEffect } from 'react';

const STORAGE_KEY = 'it-strategy-tooltips-dismissed';

export function OnboardingTooltip({ id, children, position = 'bottom' }: { id: string; children: React.ReactNode; position?: 'top' | 'bottom' }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const dismissed_ids: string[] = raw ? JSON.parse(raw) : [];
      if (!dismissed_ids.includes(id)) setDismissed(false);
    } catch { /* ignore */ }
  }, [id]);

  if (dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      ids.push(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch { /* ignore */ }
  }

  return (
    <div className={`absolute z-20 left-0 right-0 ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
      <div className="bg-accent/10 border border-accent/30 rounded-lg px-4 py-2.5 text-xs text-text-secondary flex items-center justify-between">
        <span>{children}</span>
        <button onClick={dismiss} className="ml-3 text-text-tertiary hover:text-white text-xs">&#x2715;</button>
      </div>
    </div>
  );
}
