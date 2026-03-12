export interface ValidationIssue {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  itemId?: string;
  path?: string;
}

export function validateAssessment(_data: any): ValidationIssue[] {
  return [];
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
