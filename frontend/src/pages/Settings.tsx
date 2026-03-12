import { useStore } from '@/store';
import { WEIGHTING_MODELS } from '@/types';

export function SettingsPage() {
  const { data, updateData } = useStore();
  if (!data) return null;

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-text-primary mb-2">Settings</h2>
      <p className="text-sm text-text-tertiary mb-8">Configure scoring weights, targets, and extensions.</p>

      {/* Weighting Model */}
      <div className="bg-surface-medium border border-border rounded-xl p-6 mb-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Scoring Weight Model</h3>
        <select
          value={data.scoring_config.weighting_model}
          onChange={(e) => {
            const model = e.target.value;
            const weights = WEIGHTING_MODELS[model]?.weights;
            if (!weights) return;
            updateData((d) => {
              d.scoring_config.weighting_model = model;
              d.scoring_config.pillar_weights = { ...weights };
              d.pillars.forEach((p) => {
                p.weight = weights[p.id] ?? p.weight;
              });
            });
          }}
          className="w-full px-4 py-2.5 bg-surface-elevated border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50"
        >
          {Object.entries(WEIGHTING_MODELS).map(([key, model]) => (
            <option key={key} value={key}>
              {model.label}
            </option>
          ))}
        </select>

        <div className="mt-4 grid grid-cols-4 gap-2.5">
          {data.pillars.map((p) => (
            <div key={p.id} className="text-center p-3 bg-surface-elevated rounded-lg">
              <div className="text-[11px] text-text-tertiary mb-1 leading-snug">{p.name}</div>
              <div className="text-sm font-semibold text-text-primary">{(p.weight * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Target Scores */}
      <div className="bg-surface-medium border border-border rounded-xl p-6 mb-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Target Scores (for Gap Analysis)</h3>
        <div className="space-y-3">
          {data.pillars.map((p) => (
            <div key={p.id} className="flex items-center gap-4">
              <label className="text-sm text-text-secondary w-48">{p.name}</label>
              <input
                type="number"
                min={1}
                max={4}
                step={0.5}
                value={data.target_scores[p.id] ?? ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  updateData((d) => {
                    d.target_scores[p.id] = isNaN(val) ? 0 : Math.min(4, Math.max(1, val));
                  });
                }}
                className="w-24 px-4 py-2 text-sm bg-surface-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Government Compliance Extension */}
      <div className="bg-surface-medium border border-border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Government Compliance Extension</h3>
            <p className="text-xs text-text-tertiary mt-1">
              Adds Federal (FITARA/GAO ITIM) and State (NASCIO) compliance assessments
            </p>
          </div>
          <button
            onClick={() => updateData(d => { d.gov_compliance_enabled = !d.gov_compliance_enabled; })}
            className={`relative w-11 h-6 rounded-full transition-colors ${data.gov_compliance_enabled ? 'bg-accent' : 'bg-surface-muted'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${data.gov_compliance_enabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
