import { SCORE_LABELS, SCORE_COLORS } from '@/types';

interface ScoringWidgetProps {
  score: number | null;
  na: boolean;
  onChange: (score: number | null, na: boolean) => void;
}

const SCORE_DESCRIPTIONS: Record<number, string> = {
  1: 'Reactive, ad-hoc, minimal documentation',
  2: 'Defined processes emerging, inconsistent adoption',
  3: 'Standardized, documented, consistently applied',
  4: 'Continuously improved, measured, industry-leading',
};

export function ScoringWidget({ score, na, onChange }: ScoringWidgetProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4].map((level) => (
        <button
          key={level}
          onClick={() => onChange(level, false)}
          title={`${SCORE_LABELS[level]}: ${SCORE_DESCRIPTIONS[level]}`}
          className={`w-8 h-8 text-xs font-semibold rounded-lg transition-all duration-150 border ${
            score === level && !na
              ? 'text-white border-transparent shadow-lg'
              : 'border-border text-text-tertiary hover:border-border-hover hover:text-text-secondary'
          }`}
          style={
            score === level && !na
              ? { backgroundColor: SCORE_COLORS[level], boxShadow: `0 0 12px ${SCORE_COLORS[level]}40` }
              : undefined
          }
        >
          {level}
        </button>
      ))}
      <button
        onClick={() => onChange(null, true)}
        title="Not Applicable — requires justification"
        className={`w-8 h-8 text-[10px] font-semibold rounded-lg transition-all duration-150 border ${
          na
            ? 'bg-text-tertiary text-page-bg border-transparent'
            : 'border-border text-text-tertiary hover:border-border-hover hover:text-text-secondary'
        }`}
      >
        N/A
      </button>
    </div>
  );
}

interface ConfidenceWidgetProps {
  confidence: 'High' | 'Medium' | 'Low' | null;
  onChange: (confidence: 'High' | 'Medium' | 'Low') => void;
}

const CONFIDENCE_DESCRIPTIONS: Record<string, string> = {
  High: 'Multiple independent evidence sources',
  Medium: 'Primary sources or limited corroboration',
  Low: 'Single source or incomplete evidence',
};

const CONFIDENCE_SHORT: Record<string, string> = {
  High: 'H',
  Medium: 'M',
  Low: 'L',
};

export function ConfidenceWidget({ confidence, onChange }: ConfidenceWidgetProps) {
  return (
    <div className="flex items-center gap-1">
      {(['High', 'Medium', 'Low'] as const).map((level) => (
        <button
          key={level}
          onClick={() => onChange(level)}
          title={`${level}: ${CONFIDENCE_DESCRIPTIONS[level]}`}
          className={`w-8 h-8 text-[10px] font-semibold rounded-lg transition-all duration-150 border ${
            confidence === level
              ? 'bg-accent text-page-bg border-transparent shadow-lg'
              : 'border-border text-text-tertiary hover:border-border-hover hover:text-text-secondary'
          }`}
          style={
            confidence === level
              ? { boxShadow: '0 0 12px rgba(27, 161, 226, 0.3)' }
              : undefined
          }
        >
          {CONFIDENCE_SHORT[level]}
        </button>
      ))}
    </div>
  );
}
