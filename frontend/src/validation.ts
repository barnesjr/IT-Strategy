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
