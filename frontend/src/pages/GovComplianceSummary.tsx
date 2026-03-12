import { Link } from 'react-router-dom';
import { useStore } from '@/store';
import { govComplianceSectionScore, govComplianceOverallScore, capabilityAreaCompletion } from '@/scoring';
import { getMaturityBand } from '@/types';
import type { ComplianceSection, ComplianceSubModule } from '@/types';

function SectionCard({ section, basePath }: { section: ComplianceSection; basePath: string }) {
  const score = govComplianceSectionScore(section);
  const band = score !== null ? getMaturityBand(score) : null;
  let scored = 0, total = 0;
  for (const ca of section.capability_areas) {
    const c = capabilityAreaCompletion(ca);
    scored += c.scored;
    total += c.total;
  }
  const pct = total > 0 ? Math.round((scored / total) * 100) : 0;

  return (
    <Link to={`${basePath}/${section.id}`}
      className="block p-5 bg-surface-medium border border-border rounded-xl hover:border-accent/40 transition-all">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">{section.name}</h3>
        {score !== null && (
          <span className="text-sm font-medium px-2.5 py-1 rounded-lg"
            style={{ color: band!.color, backgroundColor: band!.color + '12' }}>
            {score.toFixed(2)}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1 h-1 bg-surface-elevated rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ backgroundColor: score !== null ? band!.color : '#1BA1E2', width: `${pct}%` }} />
        </div>
        <span className="text-[11px] text-text-tertiary font-mono">{scored}/{total}</span>
      </div>
    </Link>
  );
}

function SubModuleSection({ label, subModule, basePath }: { label: string; subModule: ComplianceSubModule; basePath: string }) {
  if (!subModule.enabled) {
    return (
      <div className="mb-6">
        <h3 className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest mb-2">{label}</h3>
        <p className="text-xs text-text-tertiary">Enable in the sidebar to begin assessment.</p>
      </div>
    );
  }
  return (
    <div className="mb-6">
      <h3 className="text-[11px] font-semibold text-accent-bright uppercase tracking-widest mb-3">{label}</h3>
      <div className="grid gap-3">
        {subModule.sections.map(section => (
          <SectionCard key={section.id} section={section} basePath={basePath} />
        ))}
      </div>
    </div>
  );
}

export default function GovComplianceSummary() {
  const { data } = useStore();

  if (!data?.gov_compliance_enabled || !data.gov_compliance_extension) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-3">Government Compliance Module</h2>
        <p className="text-sm text-text-tertiary mb-6">
          Adds Federal (FITARA/GAO ITIM) and State (NASCIO) compliance assessments.
          Enable in the sidebar to begin.
        </p>
      </div>
    );
  }

  const ext = data.gov_compliance_extension;
  const overallScore = govComplianceOverallScore(data);
  const overallBand = overallScore !== null ? getMaturityBand(overallScore) : null;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary">Government Compliance</h2>
        <div className="flex items-center gap-5 mt-3">
          {overallScore !== null && (
            <span className="text-sm font-medium" style={{ color: overallBand!.color }}>
              Overall: {overallScore.toFixed(2)} — {overallBand!.label}
            </span>
          )}
        </div>
      </div>

      <SubModuleSection label="Federal (FITARA / GAO ITIM)" subModule={ext.federal} basePath="/gov-compliance" />
      <SubModuleSection label="State (NASCIO)" subModule={ext.state} basePath="/gov-compliance" />
    </div>
  );
}
