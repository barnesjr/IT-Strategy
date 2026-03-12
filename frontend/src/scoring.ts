import type { AssessmentItem, CapabilityArea, Pillar, ComplianceSection, ComplianceSubModule, AssessmentData } from './types';

export function getItemsScored(items: AssessmentItem[]): number {
  return items.filter((i) => i.score !== null || i.na).length;
}

export function getItemsTotal(items: AssessmentItem[]): number {
  return items.length;
}

export function averageScore(items: AssessmentItem[]): number | null {
  const scored = items.filter((i) => i.score !== null && !i.na);
  if (scored.length === 0) return null;
  return scored.reduce((sum, i) => sum + (i.score as number), 0) / scored.length;
}

export function capabilityAreaScore(ca: CapabilityArea): number | null {
  return averageScore(ca.items);
}

export function capabilityAreaCompletion(ca: CapabilityArea): { scored: number; total: number } {
  return { scored: getItemsScored(ca.items), total: getItemsTotal(ca.items) };
}

export function pillarScore(pillar: Pillar): number | null {
  const allItems = pillar.capability_areas.flatMap((ca) => ca.items);
  return averageScore(allItems);
}

export function pillarCompletion(pillar: Pillar): { scored: number; total: number } {
  const allItems = pillar.capability_areas.flatMap((ca) => ca.items);
  return { scored: getItemsScored(allItems), total: getItemsTotal(allItems) };
}

export function govComplianceSectionScore(section: ComplianceSection): number | null {
  const allItems = section.capability_areas.flatMap(ca => ca.items);
  return averageScore(allItems);
}

export function govComplianceOverallScore(data: AssessmentData): number | null {
  if (!data.gov_compliance_enabled || !data.gov_compliance_extension) return null;
  const items: AssessmentItem[] = [];
  const ext = data.gov_compliance_extension;
  if (ext.federal.enabled) {
    items.push(...ext.federal.sections.flatMap(s => s.capability_areas.flatMap(ca => ca.items)));
  }
  if (ext.state.enabled) {
    items.push(...ext.state.sections.flatMap(s => s.capability_areas.flatMap(ca => ca.items)));
  }
  return averageScore(items);
}

export function weightedCompositeScore(data: AssessmentData): number | null {
  let totalWeight = 0;
  let weightedSum = 0;
  const weights = data.scoring_config.pillar_weights;
  const govEnabled = data.gov_compliance_enabled && data.gov_compliance_extension;
  const sumOfPillarWeights = data.pillars.reduce((s, p) => s + (weights[p.id] ?? 0), 0);
  const scaleFactor = govEnabled ? 0.9 / (sumOfPillarWeights || 1) : 1;

  for (const pillar of data.pillars) {
    const score = pillarScore(pillar);
    const weight = weights[pillar.id] ?? 0;
    if (score !== null) {
      const w = weight * scaleFactor;
      weightedSum += score * w;
      totalWeight += w;
    }
  }

  if (govEnabled) {
    const gcScore = govComplianceOverallScore(data);
    if (gcScore !== null) {
      weightedSum += gcScore * 0.10;
      totalWeight += 0.10;
    }
  }

  return totalWeight > 0 ? weightedSum / totalWeight : null;
}

export function overallCompletion(data: AssessmentData): { scored: number; total: number } {
  let scored = 0, total = 0;
  for (const pillar of data.pillars) {
    const c = pillarCompletion(pillar);
    scored += c.scored;
    total += c.total;
  }
  if (data.gov_compliance_enabled && data.gov_compliance_extension) {
    const ext = data.gov_compliance_extension;
    const addItems = (sections: ComplianceSection[]) => {
      for (const s of sections) {
        for (const ca of s.capability_areas) {
          const c = capabilityAreaCompletion(ca);
          scored += c.scored;
          total += c.total;
        }
      }
    };
    if (ext.federal.enabled) addItems(ext.federal.sections);
    if (ext.state.enabled) addItems(ext.state.sections);
  }
  return { scored, total };
}
