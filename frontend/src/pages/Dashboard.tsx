import { useState } from 'react';
import { useStore } from '@/store';
import { exportDeliverable } from '@/api';
import { FileDown, Loader2, CheckCircle } from 'lucide-react';
import {
  pillarScore,
  pillarCompletion,
  weightedCompositeScore,
  overallCompletion,
  govComplianceOverallScore,
} from '@/scoring';
import { getMaturityBand, MATURITY_BANDS } from '@/types';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-surface-medium border border-border rounded-xl p-6 transition-colors hover:border-border-hover ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold text-accent-bright uppercase tracking-widest mb-3">{children}</h3>
  );
}

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

export function DashboardPage() {
  const { data } = useStore();
  if (!data) return null;

  const composite = weightedCompositeScore(data);
  const band = composite !== null ? getMaturityBand(composite) : null;
  const completion = overallCompletion(data);
  const completionPct = completion.total > 0 ? Math.round((completion.scored / completion.total) * 100) : 0;

  const radarData = data.pillars.map((p) => ({
    pillar: p.name,
    score: pillarScore(p) ?? 0,
    target: data.target_scores[p.id] ?? 3.0,
    fullMark: 4,
  }));

  if (data.gov_compliance_enabled) {
    const gcScore = govComplianceOverallScore(data);
    radarData.push({
      pillar: 'Gov Compliance',
      score: gcScore ?? 0,
      target: 3.0,
      fullMark: 4,
    });
  }

  const gapData = data.pillars.map((p) => {
    const current = pillarScore(p) ?? 0;
    const target = data.target_scores[p.id] ?? 3.0;
    return {
      pillar: p.name.length > 10 ? p.name.slice(0, 10) + '...' : p.name,
      current,
      target,
      gap: Math.max(0, target - current),
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-text-primary">Dashboard</h2>
        <ExportButton
          label="Export Summary"
          exportId="executive-summary"
        />
      </div>

      {/* Top row */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        <Card>
          <SectionLabel>Overall Maturity Score</SectionLabel>
          {composite !== null ? (
            <>
              <div className="text-4xl font-bold mt-1" style={{ color: band!.color }}>
                {composite.toFixed(2)}
              </div>
              <div className="text-sm font-medium mt-2" style={{ color: band!.color }}>
                {band!.label}
              </div>
            </>
          ) : (
            <div className="text-3xl text-text-tertiary mt-1">--</div>
          )}
        </Card>

        <Card>
          <SectionLabel>Maturity Band</SectionLabel>
          <div className="space-y-2 mt-1">
            {MATURITY_BANDS.map((b) => {
              const isActive = band && b.label === band.label;
              return (
                <div key={b.label} className="flex items-center gap-2.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200"
                    style={{
                      backgroundColor: b.color,
                      opacity: isActive ? 1 : 0.25,
                      transform: isActive ? 'scale(1.4)' : 'scale(1)',
                    }}
                  />
                  <span className={`text-xs ${isActive ? 'font-semibold text-text-primary' : 'text-text-tertiary'}`}>
                    {b.label}
                  </span>
                  <span className="text-[10px] text-text-tertiary ml-auto font-mono">
                    {b.min.toFixed(1)}&ndash;{b.max.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <SectionLabel>Assessment Progress</SectionLabel>
          <div className="text-4xl font-bold text-accent mt-1">{completionPct}%</div>
          <div className="text-sm text-text-secondary mt-2">
            {completion.scored} / {completion.total} items scored
          </div>
          <div className="mt-4 space-y-2">
            {data.pillars.map((p) => {
              const pc = pillarCompletion(p);
              const pPct = pc.total > 0 ? Math.round((pc.scored / pc.total) * 100) : 0;
              return (
                <div key={p.id} className="flex items-center gap-2.5">
                  <span className="text-[11px] text-text-secondary w-32 truncate">{p.name}</span>
                  <div className="flex-1 h-1 bg-surface-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-500"
                      style={{ width: `${pPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-text-tertiary w-8 text-right font-mono">{pPct}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        <Card>
          <SectionLabel>Pillar Maturity Profile</SectionLabel>
          <div className="mt-2">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2A2A2E" />
                <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 11, fill: '#D0D0D0' }} />
                <PolarRadiusAxis angle={90} domain={[0, 4]} tick={{ fontSize: 10, fill: '#8A8A8E' }} tickCount={5} />
                <Radar
                  name="Current"
                  dataKey="score"
                  stroke="#1BA1E2"
                  fill="#1BA1E2"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke="#8A8A8E"
                  fill="#8A8A8E"
                  fillOpacity={0.05}
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#D0D0D0' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionLabel>Gap Analysis: Current vs Target</SectionLabel>
          <div className="mt-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gapData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" />
                <XAxis type="number" domain={[0, 4]} tick={{ fontSize: 11, fill: '#8A8A8E' }} />
                <YAxis dataKey="pillar" type="category" tick={{ fontSize: 11, fill: '#D0D0D0' }} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1C1C1E',
                    border: '1px solid #2A2A2E',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#D0D0D0' }}
                />
                <Bar dataKey="current" fill="#1BA1E2" name="Current" radius={[0, 4, 4, 0]} barSize={14} />
                <Bar dataKey="target" fill="#3A3A3E" name="Target" radius={[0, 4, 4, 0]} barSize={14} opacity={0.5} stroke="#8A8A8E" strokeWidth={1} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#D0D0D0' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
