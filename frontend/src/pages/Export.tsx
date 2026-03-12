import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store';
import { exportDeliverable } from '@/api';
import { validateAssessment, getIssueCounts } from '@/validation';
import type { ValidationIssue } from '@/validation';
import {
  FileDown,
  FileText,
  FileSpreadsheet,
  Presentation,
  Loader2,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface ExportStatus {
  loading: boolean;
  success: boolean;
  error: string | null;
  filenames: string[];
}

const DELIVERABLES = [
  { id: 'findings' as const, code: 'D-01', name: 'Assessment Findings', format: 'DOCX', icon: FileText },
  { id: 'executive-summary' as const, code: 'D-02', name: 'Executive Summary', format: 'DOCX', icon: FileText },
  { id: 'gap-analysis' as const, code: 'D-03', name: 'Gap Analysis & Roadmap', format: 'DOCX', icon: FileText },
  { id: 'workbook' as const, code: 'D-04', name: 'Scored Assessment Workbook', format: 'XLSX', icon: FileSpreadsheet },
  { id: 'outbrief' as const, code: 'D-05', name: 'Out-Brief Presentation', format: 'PPTX', icon: Presentation },
  { id: 'heatmap' as const, code: 'D-06', name: 'Maturity Heatmap', format: 'XLSX', icon: FileSpreadsheet },
  { id: 'quick-wins' as const, code: 'D-07', name: 'Quick Wins Report', format: 'DOCX', icon: FileText },
  { id: 'compliance-mapping' as const, code: 'D-08', name: 'Compliance Mapping', format: 'DOCX', icon: FileText },
];

function ValidationPanel({ issues }: { issues: ValidationIssue[] }) {
  const counts = getIssueCounts(issues);
  const [expandedSeverity, setExpandedSeverity] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const errors = issues.filter((i) => i.severity === 'error');
    const warnings = issues.filter((i) => i.severity === 'warning');
    const infos = issues.filter((i) => i.severity === 'info');
    return { error: errors, warning: warnings, info: infos };
  }, [issues]);

  if (counts.total === 0) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
        <CheckCircle size={16} className="text-green-400 shrink-0" />
        <span className="text-sm text-green-400 font-medium">All items pass validation checks</span>
      </div>
    );
  }

  const sections: {
    key: 'error' | 'warning' | 'info';
    label: string;
    icon: typeof AlertCircle;
    color: string;
    bgColor: string;
  }[] = [
    { key: 'error', label: 'Errors', icon: AlertCircle, color: 'text-red-400', bgColor: 'bg-red-500/10' },
    { key: 'warning', label: 'Warnings', icon: AlertTriangle, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
    { key: 'info', label: 'Info', icon: Info, color: 'text-text-tertiary', bgColor: 'bg-surface-elevated' },
  ];

  return (
    <div className="border border-border rounded-xl mb-6 overflow-hidden">
      <div className="px-5 py-3 bg-surface-medium flex items-center gap-4">
        <span className="text-[11px] font-semibold text-accent-bright uppercase tracking-widest">Validation</span>
        <div className="flex items-center gap-3 ml-auto">
          {counts.error > 0 && (
            <span className="flex items-center gap-1 text-xs text-red-400">
              <AlertCircle size={12} /> {counts.error}
            </span>
          )}
          {counts.warning > 0 && (
            <span className="flex items-center gap-1 text-xs text-amber-400">
              <AlertTriangle size={12} /> {counts.warning}
            </span>
          )}
          {counts.info > 0 && (
            <span className="flex items-center gap-1 text-xs text-text-tertiary">
              <Info size={12} /> {counts.info}
            </span>
          )}
        </div>
      </div>
      <div className="divide-y divide-border-subtle">
        {sections.map(({ key, label, icon: Icon, color, bgColor }) => {
          const items = grouped[key];
          if (items.length === 0) return null;
          const isExpanded = expandedSeverity === key;
          return (
            <div key={key}>
              <button
                onClick={() => setExpandedSeverity(isExpanded ? null : key)}
                className={`w-full flex items-center gap-3 px-5 py-2.5 ${bgColor} hover:brightness-110 transition-all`}
              >
                <Icon size={14} className={color} />
                <span className={`text-xs font-medium ${color}`}>
                  {label} ({items.length})
                </span>
                {isExpanded ? (
                  <ChevronDown size={12} className="ml-auto text-text-tertiary" />
                ) : (
                  <ChevronRight size={12} className="ml-auto text-text-tertiary" />
                )}
              </button>
              {isExpanded && (
                <div className="px-5 py-2 space-y-1 bg-surface-dark/50 max-h-48 overflow-y-auto">
                  {items.map((issue, i) => (
                    <Link
                      key={`${issue.itemId}-${issue.rule}-${i}`}
                      to={`${issue.path ?? ''}?focus=${issue.itemId ?? ''}`}
                      className="flex items-center gap-2 py-1.5 text-xs text-text-secondary hover:text-accent transition-colors"
                    >
                      <span className="truncate flex-1">{issue.message}</span>
                      {issue.itemId && (
                        <span className="text-text-tertiary font-mono shrink-0">{issue.itemId}</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ExportPage() {
  const { data } = useStore();
  const [statuses, setStatuses] = useState<Record<string, ExportStatus>>({});
  const [allLoading, setAllLoading] = useState(false);

  const issues = useMemo(() => (data ? validateAssessment(data) : []), [data]);
  const hasErrors = issues.some((i) => i.severity === 'error');

  async function handleExport(id: (typeof DELIVERABLES)[number]['id']) {
    setStatuses((s) => ({ ...s, [id]: { loading: true, success: false, error: null, filenames: [] } }));
    try {
      const result = await exportDeliverable(id);
      setStatuses((s) => ({ ...s, [id]: { loading: false, success: true, error: null, filenames: result.filenames } }));
    } catch (e) {
      setStatuses((s) => ({
        ...s,
        [id]: { loading: false, success: false, error: (e as Error).message, filenames: [] },
      }));
    }
  }

  async function handleExportAll() {
    setAllLoading(true);
    try {
      const result = await exportDeliverable('all');
      const fileMap: Record<string, string[]> = {};
      for (const f of result.filenames) {
        for (const d of DELIVERABLES) {
          if (f.startsWith(d.code)) {
            if (!fileMap[d.id]) fileMap[d.id] = [];
            fileMap[d.id].push(f);
          }
        }
      }
      const newStatuses: Record<string, ExportStatus> = {};
      for (const d of DELIVERABLES) {
        newStatuses[d.id] = { loading: false, success: true, error: null, filenames: fileMap[d.id] ?? [] };
      }
      setStatuses(newStatuses);
    } catch (e) {
      for (const d of DELIVERABLES) {
        setStatuses((s) => ({
          ...s,
          [d.id]: { loading: false, success: false, error: (e as Error).message, filenames: [] },
        }));
      }
    } finally {
      setAllLoading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Export Deliverables</h2>
          <p className="text-sm text-text-tertiary mt-1">
            Generate IT Strategy Assessment reports, workbooks, and presentations.
          </p>
        </div>
        <button
          onClick={handleExportAll}
          disabled={allLoading || hasErrors}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-page-bg text-sm font-semibold rounded-lg hover:brightness-110 disabled:opacity-50 transition-all"
          title={hasErrors ? 'Fix validation errors before exporting all' : undefined}
        >
          {allLoading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
          Export All
        </button>
      </div>

      <ValidationPanel issues={issues} />

      {hasErrors && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 text-xs text-red-400">
          <strong>Export All is disabled.</strong> Fix validation errors above to enable bulk export, or export
          individual deliverables below.
        </div>
      )}

      <div className="space-y-3">
        {DELIVERABLES.map((d) => {
          const status = statuses[d.id];
          const Icon = d.icon;
          return (
            <div
              key={d.id}
              className="bg-surface-medium border border-border rounded-xl p-5 flex items-center gap-5 transition-colors hover:border-border-hover"
            >
              <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center shrink-0">
                <Icon size={20} className="text-text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono text-text-tertiary">{d.code}</span>
                  <h3 className="text-sm font-semibold text-text-primary">{d.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 bg-surface-elevated text-text-tertiary rounded-md font-medium">
                    {d.format}
                  </span>
                </div>
                {status?.success && status.filenames.length > 0 && (
                  <p className="text-xs text-green-400 mt-1.5">{status.filenames.join(', ')}</p>
                )}
                {status?.error && <p className="text-xs text-red-400 mt-1.5">{status.error}</p>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {status?.loading ? (
                  <Loader2 size={16} className="animate-spin text-accent" />
                ) : status?.success ? (
                  <CheckCircle size={16} className="text-green-400" />
                ) : status?.error ? (
                  <AlertCircle size={16} className="text-red-400" />
                ) : null}
                <button
                  onClick={() => handleExport(d.id)}
                  disabled={status?.loading}
                  className="px-4 py-2 text-xs font-semibold text-accent border border-accent/30 rounded-lg hover:bg-accent/10 disabled:opacity-50 transition-all"
                >
                  Export
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-text-tertiary mt-6">
        Exports are saved to the{' '}
        <code className="bg-surface-elevated px-1.5 py-0.5 rounded-md text-text-secondary">exports/</code> directory
        alongside the application.
      </p>
    </div>
  );
}
