import type { AssessmentData, AssessmentItem, ComplianceSubModule } from './types';

export interface ValidationIssue {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  itemId: string;
  areaName: string;
  path: string;
}

function checkItem(item: AssessmentItem, areaName: string, path: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (item.na && !item.na_justification) {
    issues.push({ rule: 'na-justification', severity: 'error', message: 'N/A item missing justification', itemId: item.id, areaName, path });
  }
  if (item.score !== null && !item.confidence) {
    issues.push({ rule: 'missing-confidence', severity: 'warning', message: 'Scored item missing confidence level', itemId: item.id, areaName, path });
  }
  if (item.score !== null && !item.notes) {
    issues.push({ rule: 'missing-notes', severity: 'info', message: 'Scored item has no notes', itemId: item.id, areaName, path });
  }
  return issues;
}

export function validateAssessment(data: AssessmentData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  // Pillars
  for (const pillar of data.pillars) {
    for (const ca of pillar.capability_areas) {
      for (const item of ca.items) {
        issues.push(...checkItem(item, ca.name, `/pillars/${pillar.id}/${ca.id}`));
      }
    }
  }
  // Gov Compliance
  if (data.gov_compliance_enabled && data.gov_compliance_extension) {
    const ext = data.gov_compliance_extension;
    const validateSubModule = (sub: ComplianceSubModule) => {
      if (!sub.enabled) return;
      for (const section of sub.sections) {
        for (const ca of section.capability_areas) {
          for (const item of ca.items) {
            issues.push(...checkItem(item, ca.name, `/gov-compliance/${section.id}/${ca.id}`));
          }
        }
      }
    };
    validateSubModule(ext.federal);
    validateSubModule(ext.state);
  }
  return issues;
}

export function getItemIssues(issues: ValidationIssue[], itemId: string): ValidationIssue[] {
  return issues.filter(i => i.itemId === itemId);
}

export function getIssueCounts(issues: ValidationIssue[]) {
  return {
    error: issues.filter(i => i.severity === 'error').length,
    warning: issues.filter(i => i.severity === 'warning').length,
    info: issues.filter(i => i.severity === 'info').length,
    total: issues.length,
  };
}
