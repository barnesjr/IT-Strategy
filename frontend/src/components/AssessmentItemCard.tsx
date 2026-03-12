import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, X, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { ScoringWidget, ConfidenceWidget } from './ScoringWidget';
import type { AssessmentItem, EvidenceReference, FrameworkItem } from '@/types';
import type { ValidationIssue } from '@/validation';

interface AssessmentItemCardProps {
  item: AssessmentItem;
  frameworkItem?: FrameworkItem;
  onUpdate: (updates: Partial<AssessmentItem>) => void;
  validationIssues?: ValidationIssue[];
  expanded?: boolean;
  onToggleExpand?: () => void;
}

const SEVERITY_ICON = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const SEVERITY_COLOR = {
  error: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-text-tertiary',
};

export function AssessmentItemCard({ item, frameworkItem, onUpdate, validationIssues = [], expanded: externalExpanded, onToggleExpand }: AssessmentItemCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = externalExpanded ?? internalExpanded;
  const toggleExpand = onToggleExpand ?? (() => setInternalExpanded(!internalExpanded));
  const [showRubric, setShowRubric] = useState(false);

  const activeIssues = validationIssues.filter((i) => i.rule !== 'unscored');

  return (
    <div className="border border-border rounded-xl bg-surface-medium transition-colors hover:border-border-hover">
      {/* Header row */}
      <div className="flex items-start gap-3 p-5">
        <button
          onClick={toggleExpand}
          className="mt-0.5 text-text-tertiary hover:text-text-primary transition-colors"
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-text-primary leading-relaxed">{item.text}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-text-tertiary font-mono">{item.id}</span>
            {activeIssues.map((issue) => {
              const Icon = SEVERITY_ICON[issue.severity];
              return (
                <span
                  key={issue.rule}
                  className={`flex items-center gap-1 text-[10px] ${SEVERITY_COLOR[issue.severity]}`}
                  title={issue.message}
                >
                  <Icon size={10} />
                  {issue.message}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <ScoringWidget
            score={item.score}
            na={item.na}
            onChange={(score, na) => {
              onUpdate({ score, na, na_justification: na ? item.na_justification ?? '' : null });
              if (na && !isExpanded) toggleExpand();
            }}
          />
          <ConfidenceWidget
            confidence={item.confidence}
            onChange={(confidence) => onUpdate({ confidence })}
          />
        </div>
      </div>

      {/* N/A justification */}
      {item.na && (
        <div className="px-5 pb-4 pl-12">
          <label className="block text-[11px] font-medium text-amber-400 mb-1.5">N/A Justification (required)</label>
          <input
            type="text"
            value={item.na_justification ?? ''}
            onChange={(e) => onUpdate({ na_justification: e.target.value })}
            className="w-full px-4 py-2 text-sm bg-surface-elevated border border-amber-500/30 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            placeholder="Explain why this item is not applicable..."
          />
        </div>
      )}

      {/* Expanded section */}
      {isExpanded && (
        <div className="border-t border-border-subtle p-5 pl-12 space-y-5">
          {/* Rubric */}
          {frameworkItem?.rubric && (
            <div>
              <button
                onClick={() => setShowRubric(!showRubric)}
                className="text-xs text-accent hover:text-accent-bright font-medium flex items-center gap-1.5 transition-colors"
              >
                {showRubric ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                Scoring Rubric
              </button>
              {showRubric && (
                <div className="mt-3 grid grid-cols-4 gap-2.5">
                  {(['initial', 'developing', 'established', 'optimizing'] as const).map((level, i) => (
                    <div key={level} className="p-3 rounded-lg bg-surface-elevated border border-border-subtle">
                      <div className="text-[10px] font-semibold text-accent-bright uppercase tracking-wide mb-1.5">
                        {i + 1} — {level}
                      </div>
                      <p className="text-[11px] text-text-secondary leading-relaxed">{frameworkItem.rubric[level]}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-medium text-text-secondary mb-1.5">Notes & Observations</label>
            <textarea
              value={item.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 text-sm bg-surface-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 resize-y"
              placeholder="Enter observations, evidence, and recommendations..."
            />
          </div>

          {/* Evidence References */}
          <div>
            <label className="block text-[11px] font-medium text-text-secondary mb-2">Evidence References</label>
            {item.evidence_references.map((ref, i) => (
              <EvidenceRefRow
                key={i}
                ref_={ref}
                onChange={(updated) => {
                  const refs = [...item.evidence_references];
                  refs[i] = updated;
                  onUpdate({ evidence_references: refs });
                }}
                onRemove={() => {
                  const refs = item.evidence_references.filter((_, idx) => idx !== i);
                  onUpdate({ evidence_references: refs });
                }}
              />
            ))}
            <button
              onClick={() =>
                onUpdate({
                  evidence_references: [...item.evidence_references, { document: '', section: '', date: '' }],
                })
              }
              className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-bright mt-2 transition-colors"
            >
              <Plus size={12} /> Add reference
            </button>
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-[11px] font-medium text-text-secondary mb-2">File Attachments</label>
            {item.attachments.map((path, i) => (
              <div key={i} className="flex items-center gap-2.5 mb-2">
                <input
                  type="text"
                  value={path}
                  onChange={(e) => {
                    const updated = [...item.attachments];
                    updated[i] = e.target.value;
                    onUpdate({ attachments: updated });
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-surface-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 font-mono"
                  placeholder="Relative path to evidence file (e.g., evidence/scan-report.pdf)"
                />
                <button
                  onClick={() => {
                    const updated = item.attachments.filter((_, idx) => idx !== i);
                    onUpdate({ attachments: updated });
                  }}
                  className="text-text-tertiary hover:text-red-400 transition-colors p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => onUpdate({ attachments: [...item.attachments, ''] })}
              className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-bright mt-2 transition-colors"
            >
              <Plus size={12} /> Add attachment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EvidenceRefRow({
  ref_,
  onChange,
  onRemove,
}: {
  ref_: EvidenceReference;
  onChange: (ref: EvidenceReference) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-2">
      <input
        type="text"
        value={ref_.document}
        onChange={(e) => onChange({ ...ref_, document: e.target.value })}
        className="flex-1 px-3 py-1.5 text-xs bg-surface-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
        placeholder="Document name"
      />
      <input
        type="text"
        value={ref_.section}
        onChange={(e) => onChange({ ...ref_, section: e.target.value })}
        className="w-24 px-3 py-1.5 text-xs bg-surface-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
        placeholder="Section"
      />
      <input
        type="date"
        value={ref_.date}
        onChange={(e) => onChange({ ...ref_, date: e.target.value })}
        className="w-36 px-3 py-1.5 text-xs bg-surface-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      <button onClick={onRemove} className="text-text-tertiary hover:text-red-400 transition-colors p-1">
        <X size={14} />
      </button>
    </div>
  );
}
