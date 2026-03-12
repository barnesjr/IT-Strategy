import { useMemo } from 'react';
import type { AssessmentData } from '@/types';

interface NextUnscored {
  path: string;
  itemId: string;
  areaName: string;
  remaining: number;
}

export function findNextUnscored(data: AssessmentData | null): NextUnscored | null {
  if (!data) return null;

  let totalRemaining = 0;
  let first: Omit<NextUnscored, 'remaining'> | null = null;

  // Traverse pillars
  for (const pillar of data.pillars) {
    for (const ca of pillar.capability_areas) {
      for (const item of ca.items) {
        if (item.score === null && !item.na) {
          totalRemaining++;
          if (!first) {
            first = {
              path: `/pillars/${pillar.id}/${ca.id}`,
              itemId: item.id,
              areaName: ca.name,
            };
          }
        }
      }
    }
  }

  // Traverse Gov Compliance
  if (data.gov_compliance_enabled && data.gov_compliance_extension) {
    const ext = data.gov_compliance_extension;
    const traverseSubModule = (subModule: typeof ext.federal) => {
      if (!subModule.enabled) return;
      for (const section of subModule.sections) {
        for (const ca of section.capability_areas) {
          for (const item of ca.items) {
            if (item.score === null && !item.na) {
              totalRemaining++;
              if (!first) {
                first = {
                  path: `/gov-compliance/${section.id}/${ca.id}`,
                  itemId: item.id,
                  areaName: ca.name,
                };
              }
            }
          }
        }
      }
    };
    traverseSubModule(ext.federal);
    traverseSubModule(ext.state);
  }

  if (!first) return null;
  return { ...first, remaining: totalRemaining };
}

// React hook wrapper
export function useNextUnscored(data: AssessmentData | null): NextUnscored | null {
  return useMemo(() => findNextUnscored(data), [data]);
}
