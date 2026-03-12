import { useStore } from '@/store';

export function DashboardPage() {
  const { data } = useStore();
  if (!data) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">Dashboard</h2>
      <p className="text-sm text-text-tertiary mb-8">Assessment overview and scoring summary. Charts will be added in a later update.</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.pillars.map(p => (
          <div key={p.id} className="bg-surface-medium border border-border rounded-xl p-4">
            <h3 className="text-xs font-medium text-text-secondary mb-1 truncate">{p.name}</h3>
            <p className="text-lg font-bold text-text-primary">
              {(() => {
                const scores = p.capability_areas.flatMap(ca => ca.items).filter(i => i.score !== null && !i.na).map(i => i.score!);
                return scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '\u2014';
              })()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
