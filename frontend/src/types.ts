export interface EvidenceReference {
  document: string;
  section: string;
  date: string;
}

export interface AssessmentItem {
  id: string;
  text: string;
  score: number | null;
  na: boolean;
  na_justification: string | null;
  confidence: 'High' | 'Medium' | 'Low' | null;
  notes: string;
  evidence_references: EvidenceReference[];
  attachments: string[];
}

export interface CapabilityArea {
  id: string;
  name: string;
  items: AssessmentItem[];
}

export interface Pillar {
  id: string;
  name: string;
  weight: number;
  capability_areas: CapabilityArea[];
}

export interface ComplianceSection {
  id: string;
  name: string;
  capability_areas: CapabilityArea[];
}

export interface ComplianceSubModule {
  enabled: boolean;
  sections: ComplianceSection[];
}

export interface GovComplianceExtension {
  enabled: boolean;
  federal: ComplianceSubModule;
  state: ComplianceSubModule;
}

export interface ScoringConfig {
  weighting_model: string;
  pillar_weights: Record<string, number>;
  custom_weights: Record<string, number> | null;
}

export interface ClientInfo {
  name: string;
  industry: string;
  assessment_date: string;
  assessor: string;
}

export interface AssessmentMetadata {
  framework_version: string;
  tool_version: string;
  last_modified: string;
}

export interface AssessmentData {
  client_info: ClientInfo;
  assessment_metadata: AssessmentMetadata;
  scoring_config: ScoringConfig;
  pillars: Pillar[];
  gov_compliance_enabled: boolean;
  gov_compliance_extension: GovComplianceExtension | null;
  target_scores: Record<string, number>;
}

// Framework definition (read-only)
export interface FrameworkItem {
  id: string;
  text: string;
  rubric: {
    initial: string;
    developing: string;
    established: string;
    optimizing: string;
  };
}

export interface FrameworkCapabilityArea {
  id: string;
  name: string;
  items: FrameworkItem[];
}

export interface FrameworkPillar {
  id: string;
  name: string;
  weight: number;
  capability_areas: FrameworkCapabilityArea[];
}

export interface FrameworkComplianceSection {
  id: string;
  name: string;
  capability_areas: FrameworkCapabilityArea[];
}

export interface Framework {
  version: string;
  framework_alignment: string;
  pillars: FrameworkPillar[];
  gov_compliance_extension: {
    federal: { sections: FrameworkComplianceSection[] };
    state: { sections: FrameworkComplianceSection[] };
  };
  weighting_models: Record<string, { label: string; weights: Record<string, number> }>;
}

// Scoring helpers
export const SCORE_LABELS: Record<number, string> = {
  1: 'Initial',
  2: 'Developing',
  3: 'Established',
  4: 'Optimizing',
};

export const SCORE_COLORS: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#84cc16',
  4: '#22c55e',
};

export const MATURITY_BANDS = [
  { min: 1.0, max: 1.5, label: 'Reactive', color: '#ef4444' },
  { min: 1.5, max: 2.0, label: 'Emerging', color: '#f97316' },
  { min: 2.0, max: 2.5, label: 'Developing', color: '#eab308' },
  { min: 2.5, max: 3.0, label: 'Established', color: '#84cc16' },
  { min: 3.0, max: 3.5, label: 'Managed', color: '#22c55e' },
  { min: 3.5, max: 4.0, label: 'Optimizing', color: '#15803d' },
];

export function getMaturityBand(score: number) {
  for (const band of MATURITY_BANDS) {
    if (score >= band.min && score < band.max) return band;
  }
  if (score >= 4.0) return MATURITY_BANDS[MATURITY_BANDS.length - 1];
  return MATURITY_BANDS[0];
}

export const WEIGHTING_MODELS: Record<string, { label: string; weights: Record<string, number> }> = {
  balanced: {
    label: 'Balanced',
    weights: {
      governance: 0.15, strategy: 0.15, 'enterprise-architecture': 0.15,
      'service-management': 0.14, 'infrastructure-cloud': 0.14,
      'workforce-culture': 0.13, 'innovation-digital': 0.14,
    },
  },
  strategy_heavy: {
    label: 'Strategy-Heavy',
    weights: {
      governance: 0.18, strategy: 0.22, 'enterprise-architecture': 0.15,
      'service-management': 0.10, 'infrastructure-cloud': 0.12,
      'workforce-culture': 0.10, 'innovation-digital': 0.13,
    },
  },
  operations_heavy: {
    label: 'Operations-Heavy',
    weights: {
      governance: 0.12, strategy: 0.10, 'enterprise-architecture': 0.13,
      'service-management': 0.22, 'infrastructure-cloud': 0.20,
      'workforce-culture': 0.10, 'innovation-digital': 0.13,
    },
  },
  modernization: {
    label: 'Modernization',
    weights: {
      governance: 0.10, strategy: 0.12, 'enterprise-architecture': 0.18,
      'service-management': 0.10, 'infrastructure-cloud': 0.20,
      'workforce-culture': 0.10, 'innovation-digital': 0.20,
    },
  },
  governance_first: {
    label: 'Governance-First',
    weights: {
      governance: 0.25, strategy: 0.15, 'enterprise-architecture': 0.15,
      'service-management': 0.12, 'infrastructure-cloud': 0.10,
      'workforce-culture': 0.10, 'innovation-digital': 0.13,
    },
  },
};
