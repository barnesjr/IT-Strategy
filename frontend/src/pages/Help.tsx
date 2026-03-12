import { Keyboard, BookOpen, FileDown } from 'lucide-react';

export function HelpPage() {
  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-text-primary mb-8">Help & Reference</h2>

      {/* Keyboard Shortcuts */}
      <section className="mb-8">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-bright uppercase tracking-widest mb-4">
          <Keyboard size={14} /> Keyboard Shortcuts
        </h3>
        <div className="bg-surface-medium border border-border rounded-xl p-5 space-y-2 text-sm">
          {[
            ['1 / 2 / 3 / 4', 'Set score on focused item'],
            ['N', 'Toggle N/A on focused item'],
            ['H / M / L', 'Set confidence (High / Medium / Low)'],
            ['↑ / ↓ or J / K', 'Navigate between items'],
            ['Enter / Space', 'Expand or collapse focused item'],
            ['Cmd/Ctrl + K', 'Open command palette'],
            ['Cmd/Ctrl + →', 'Jump to next unscored item'],
            ['Escape', 'Close palette or deselect item'],
          ].map(([keys, desc]) => (
            <div key={keys} className="flex items-center gap-3">
              <code className="bg-surface-elevated px-2 py-1 rounded text-xs text-accent font-mono min-w-[160px]">{keys}</code>
              <span className="text-text-secondary">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Scoring Methodology */}
      <section className="mb-8">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-bright uppercase tracking-widest mb-4">
          <BookOpen size={14} /> Scoring Methodology
        </h3>
        <div className="bg-surface-medium border border-border rounded-xl p-5 space-y-3 text-sm text-text-secondary">
          <p>Each item is scored on a 1–4 maturity scale aligned with the TOGAF 10 Enterprise Architecture Framework:</p>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {[
              ['1 — Initial', 'Ad-hoc processes, limited documentation, reactive approach', '#ef4444'],
              ['2 — Developing', 'Beginning standardization, pilot programs, documented strategy', '#f97316'],
              ['3 — Established', 'Standardized processes, active governance, measurable outcomes', '#84cc16'],
              ['4 — Optimizing', 'Continuous improvement, data-driven decisions, industry-leading practices', '#22c55e'],
            ].map(([label, desc, color]) => (
              <div key={label} className="p-3 rounded-lg bg-surface-elevated border border-border-subtle">
                <div className="text-xs font-semibold mb-1" style={{ color }}>{label}</div>
                <p className="text-[11px] text-text-tertiary">{desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-3">Items may be marked N/A with justification. N/A items are excluded from score averaging.</p>
          <p>The weighted composite score combines 7 pillar scores using the selected weighting model.</p>
        </div>
      </section>

      {/* Export Guide */}
      <section className="mb-8">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-bright uppercase tracking-widest mb-4">
          <FileDown size={14} /> Export Deliverables
        </h3>
        <div className="bg-surface-medium border border-border rounded-xl p-5 space-y-2 text-sm text-text-secondary">
          {[
            ['D-01', 'Assessment Findings (DOCX)', 'Per-pillar findings with scores, capability areas, and recommendations'],
            ['D-02', 'Executive Summary (DOCX)', 'Client profile, overall score, radar chart, top priorities'],
            ['D-03', 'Gap Analysis & Roadmap (DOCX)', 'Current vs target gap matrix with severity and remediation roadmap'],
            ['D-04', 'Scored Assessment Workbook (XLSX)', 'All item scores, confidence, evidence, with auto-calculated averages'],
            ['D-05', 'Out-Brief Presentation (PPTX)', 'Presentation with executive summary, radar chart, pillar breakdowns'],
            ['D-06', 'Maturity Heatmap (XLSX)', 'Visual heatmap of maturity scores across all pillars and capability areas'],
            ['D-07', 'Quick Wins Report (DOCX)', 'Prioritized list of high-impact, low-effort improvement opportunities'],
            ['D-08', 'Compliance Mapping (DOCX)', 'Federal and state compliance alignment mapping and gap summary'],
          ].map(([code, name, desc]) => (
            <div key={code} className="flex items-start gap-3 py-1">
              <code className="bg-surface-elevated px-2 py-0.5 rounded text-[10px] text-text-tertiary font-mono shrink-0">{code}</code>
              <div>
                <div className="font-medium text-text-primary">{name}</div>
                <div className="text-xs text-text-tertiary">{desc}</div>
              </div>
            </div>
          ))}
          <p className="text-xs text-text-tertiary mt-3">
            Exports are saved to the <code className="bg-surface-elevated px-1 py-0.5 rounded">exports/</code> directory.
            Place custom templates in <code className="bg-surface-elevated px-1 py-0.5 rounded">templates/</code> to customize output formatting.
          </p>
        </div>
      </section>
    </div>
  );
}
