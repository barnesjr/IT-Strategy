import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useStore } from '@/store';
import { overallCompletion, pillarScore, capabilityAreaScore } from '@/scoring';
import { getMaturityBand } from '@/types';

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function StatsFooter() {
  const { data, saveStatus } = useStore();
  const { pillarId, areaId } = useParams();
  const location = useLocation();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  const completion = overallCompletion(data);
  const completionPct = completion.total > 0 ? Math.round((completion.scored / completion.total) * 100) : 0;

  let sectionScore: number | null = null;
  let sectionLabel = '';

  if (pillarId && areaId) {
    const parent = data.pillars.find((p) => p.id === pillarId);
    if (parent) {
      const area = parent.capability_areas.find((ca) => ca.id === areaId);
      if (area) {
        sectionScore = capabilityAreaScore(area);
        sectionLabel = area.name;
      }
    }
  } else if (pillarId) {
    const p = data.pillars.find((p) => p.id === pillarId);
    if (p) { sectionScore = pillarScore(p); sectionLabel = p.name; }
  }

  const lastSaved = data.assessment_metadata.last_modified
    ? new Date(data.assessment_metadata.last_modified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--';

  // Suppress unused variable warnings for route params used only for section detection
  void location;

  return (
    <footer className="h-10 bg-surface-dark border-t border-border-subtle flex items-center px-5 gap-6 shrink-0 text-[11px]">
      {/* Progress */}
      <div className="flex items-center gap-2.5">
        <div className="w-24 h-1 bg-surface-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <span className="text-text-secondary font-medium">{completionPct}%</span>
        <span className="text-text-tertiary">{completion.scored}/{completion.total}</span>
      </div>

      {/* Section score */}
      {sectionScore !== null && (
        <div className="flex items-center gap-1.5">
          <span className="text-text-tertiary">{sectionLabel}:</span>
          <span className="font-semibold" style={{ color: getMaturityBand(sectionScore).color }}>
            {sectionScore.toFixed(2)}
          </span>
        </div>
      )}

      <div className="flex-1" />

      {/* Session timer */}
      <span className="text-text-tertiary">Session: {formatElapsed(elapsed)}</span>

      {/* Save status */}
      <div className="flex items-center gap-1.5">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            saveStatus === 'saving' ? 'bg-yellow-400' :
            saveStatus === 'saved' ? 'bg-green-400' :
            saveStatus === 'error' ? 'bg-red-400' :
            'bg-text-tertiary'
          }`}
        />
        <span className="text-text-tertiary">Saved {lastSaved}</span>
      </div>
    </footer>
  );
}
