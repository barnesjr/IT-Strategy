import { useParams, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/store';
import { AssessmentItemCard } from '@/components/AssessmentItemCard';
import { OnboardingTooltip } from '@/components/OnboardingTooltip';
import { capabilityAreaScore, capabilityAreaCompletion } from '@/scoring';
import { validateAssessment, getItemIssues } from '@/validation';
import { SCORE_LABELS, getMaturityBand } from '@/types';
import type { AssessmentItem, CapabilityArea, FrameworkCapabilityArea } from '@/types';

export function CapabilityAreaPage() {
  const { pillarId, areaId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, framework, updateData } = useStore();
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  function toggleExpanded(index: number) {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  let area: CapabilityArea | undefined;
  let frameworkArea: FrameworkCapabilityArea | undefined;
  let parentName = '';

  if (data && framework) {
    for (const pillar of data.pillars) {
      if (pillar.id === pillarId) {
        parentName = pillar.name;
        area = pillar.capability_areas.find((ca) => ca.id === areaId);
        const fwPillar = framework.pillars.find((p) => p.id === pillarId);
        frameworkArea = fwPillar?.capability_areas.find((ca) => ca.id === areaId);
        break;
      }
    }
  }

  // Focus item from URL param
  useEffect(() => {
    const focusId = searchParams.get('focus');
    if (focusId && area) {
      const idx = area.items.findIndex((i) => i.id === focusId);
      if (idx !== -1) {
        setFocusedIndex(idx);
        setSearchParams({}, { replace: true });
        setTimeout(() => {
          itemRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [area, searchParams, setSearchParams]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!area) return;
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    const items = area.items;
    const fi = focusedIndex;

    switch (e.key) {
      case 'ArrowDown':
      case 'j':
        e.preventDefault();
        setFocusedIndex((i) => {
          const next = Math.min(i + 1, items.length - 1);
          itemRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          return next;
        });
        break;
      case 'ArrowUp':
      case 'k':
        e.preventDefault();
        setFocusedIndex((i) => {
          const next = Math.max(i - 1, 0);
          itemRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          return next;
        });
        break;
      case '1': case '2': case '3': case '4':
        if (fi >= 0 && fi < items.length) {
          e.preventDefault();
          handleItemUpdate(items[fi].id, { score: parseInt(e.key), na: false });
        }
        break;
      case 'n':
      case 'N':
        if (fi >= 0 && fi < items.length) {
          e.preventDefault();
          const item = items[fi];
          handleItemUpdate(item.id, { score: null, na: true, na_justification: item.na_justification ?? '' });
        }
        break;
      case 'h':
      case 'H':
        if (fi >= 0 && fi < items.length) { e.preventDefault(); handleItemUpdate(items[fi].id, { confidence: 'High' }); }
        break;
      case 'm':
      case 'M':
        if (fi >= 0 && fi < items.length) { e.preventDefault(); handleItemUpdate(items[fi].id, { confidence: 'Medium' }); }
        break;
      case 'l':
      case 'L':
        if (fi >= 0 && fi < items.length) { e.preventDefault(); handleItemUpdate(items[fi].id, { confidence: 'Low' }); }
        break;
      case 'Enter':
      case ' ':
        if (fi >= 0 && fi < items.length) {
          e.preventDefault();
          toggleExpanded(fi);
        }
        break;
      case 'Escape':
        setFocusedIndex(-1);
        break;
    }
  }, [area, focusedIndex]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Reset focus when navigating to a different area
  useEffect(() => {
    setFocusedIndex(-1);
  }, [pillarId, areaId]);

  if (!data || !framework || !area) {
    return <div className="text-text-tertiary">Capability area not found.</div>;
  }

  const score = capabilityAreaScore(area);
  const completion = capabilityAreaCompletion(area);
  const pct = completion.total > 0 ? Math.round((completion.scored / completion.total) * 100) : 0;
  const issues = validateAssessment(data);

  function handleItemUpdate(itemId: string, updates: Partial<AssessmentItem>) {
    updateData((d) => {
      for (const pillar of d.pillars) {
        if (pillar.id === pillarId) {
          for (const ca of pillar.capability_areas) {
            if (ca.id === areaId) {
              const item = ca.items.find((i) => i.id === itemId);
              if (item) Object.assign(item, updates);
              return;
            }
          }
        }
      }
    });
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-[11px] text-accent-bright mb-2 uppercase font-semibold tracking-widest">{parentName}</p>
        <h2 className="text-2xl font-bold text-text-primary">{area.name}</h2>
        <div className="flex items-center gap-5 mt-3">
          <span className="text-sm text-text-secondary">
            {completion.scored} / {completion.total} items scored ({pct}%)
          </span>
          {score !== null && (
            <span className="text-sm font-medium" style={{ color: getMaturityBand(score).color }}>
              Avg: {score.toFixed(2)} ({SCORE_LABELS[Math.round(score)] ?? ''})
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 relative">
        <OnboardingTooltip id="keyboard-shortcuts" position="top">
          Use <strong>1-4</strong> to score, <strong>&uarr;&darr;</strong> to navigate, <strong>H/M/L</strong> for confidence, <strong>Cmd+K</strong> to search
        </OnboardingTooltip>
        {area.items.map((item, i) => {
          const fwItem = frameworkArea?.items.find((fi) => fi.id === item.id);
          const itemIssues = getItemIssues(issues, item.id);
          return (
            <div
              key={item.id}
              ref={(el) => { itemRefs.current[i] = el; }}
              className={focusedIndex === i ? 'item-focused' : ''}
              onClick={() => setFocusedIndex(i)}
            >
              <AssessmentItemCard
                item={item}
                frameworkItem={fwItem}
                onUpdate={(updates) => handleItemUpdate(item.id, updates)}
                validationIssues={itemIssues}
                expanded={expandedItems.has(i)}
                onToggleExpand={() => toggleExpanded(i)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
