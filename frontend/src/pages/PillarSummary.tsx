import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '@/store';
import { pillarScore, pillarCompletion, capabilityAreaScore, capabilityAreaCompletion } from '@/scoring';
import { getMaturityBand } from '@/types';
import { exportDeliverable } from '@/api';
import { FileDown, Loader2, CheckCircle } from 'lucide-react';

function ExportButton({ label, exportId }: { label: string; exportId: import('@/api').ExportType }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  async function handleExport() {
    setStatus('loading');
    try {
      await exportDeliverable(exportId);
      setStatus('done');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('idle');
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={status === 'loading'}
      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-accent border border-accent/30 rounded-lg hover:bg-accent/10 disabled:opacity-50 transition-all"
    >
      {status === 'loading' ? <Loader2 size={14} className="animate-spin" /> :
       status === 'done' ? <CheckCircle size={14} className="text-green-400" /> :
       <FileDown size={14} />}
      {label}
    </button>
  );
}

export function PillarSummaryPage() {
  const { pillarId } = useParams();
  const { data } = useStore();
  if (!data) return null;

  const pillar = data.pillars.find((p) => p.id === pillarId);
  if (!pillar) return <div className="text-text-tertiary">Pillar not found.</div>;

  const score = pillarScore(pillar);
  const completion = pillarCompletion(pillar);
  const basePath = `/pillars/${pillarId}`;
  const pct = completion.total > 0 ? Math.round((completion.scored / completion.total) * 100) : 0;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary">{pillar.name}</h2>
          <ExportButton label="Export Findings" exportId="findings" />
        </div>
        <div className="flex items-center gap-5 mt-3">
          <span className="text-sm text-text-secondary">
            {completion.scored} / {completion.total} items ({pct}%)
          </span>
          {score !== null && (
            <span className="text-sm font-medium" style={{ color: getMaturityBand(score).color }}>
              Score: {score.toFixed(2)} — {getMaturityBand(score).label}
            </span>
          )}
          <span className="text-xs text-text-tertiary">Weight: {(pillar.weight * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="grid gap-3">
        {pillar.capability_areas.map((ca) => {
          const caScore = capabilityAreaScore(ca);
          const caComp = capabilityAreaCompletion(ca);
          const caPct = caComp.total > 0 ? Math.round((caComp.scored / caComp.total) * 100) : 0;
          return (
            <Link
              key={ca.id}
              to={`${basePath}/${ca.id}`}
              className="block p-5 bg-surface-medium border border-border rounded-xl hover:border-accent/40 hover:bg-surface-medium/80 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary">{ca.name}</h3>
                {caScore !== null && (
                  <span
                    className="text-sm font-medium px-2.5 py-1 rounded-lg"
                    style={{
                      color: getMaturityBand(caScore).color,
                      backgroundColor: getMaturityBand(caScore).color + '12',
                    }}
                  >
                    {caScore.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-1 bg-surface-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ backgroundColor: caScore !== null ? getMaturityBand(caScore).color : '#1BA1E2', width: `${caPct}%` }}
                  />
                </div>
                <span className="text-[11px] text-text-tertiary font-mono">
                  {caComp.scored}/{caComp.total}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
