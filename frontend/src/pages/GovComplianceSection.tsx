import { useParams, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store';
import { AssessmentItemCard } from '@/components/AssessmentItemCard';
import { capabilityAreaScore, capabilityAreaCompletion, govComplianceSectionScore } from '@/scoring';
import { SCORE_LABELS, getMaturityBand } from '@/types';
import type { AssessmentItem, CapabilityArea, ComplianceSection } from '@/types';

export default function GovComplianceSection() {
  const { sectionId, areaId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, framework, updateData } = useStore();
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Reset focus when navigating
  useEffect(() => { setFocusedIndex(-1); }, [sectionId, areaId]);

  // Find section and area from data
  const ext = data?.gov_compliance_enabled && data?.gov_compliance_extension ? data.gov_compliance_extension : null;

  const allSections: ComplianceSection[] = ext ? [
    ...(ext.federal.enabled ? ext.federal.sections : []),
    ...(ext.state.enabled ? ext.state.sections : []),
  ] : [];

  const section = allSections.find(s => s.id === sectionId);
  const area: CapabilityArea | undefined = areaId ? section?.capability_areas.find(ca => ca.id === areaId) : undefined;

  // Find framework section for rubric data
  let frameworkSection: any = null;
  if (framework?.gov_compliance_extension) {
    const fwExt = framework.gov_compliance_extension;
    frameworkSection = [...fwExt.federal.sections, ...fwExt.state.sections].find(s => s.id === sectionId);
  }
  const frameworkArea = frameworkSection?.capability_areas?.find((ca: any) => ca.id === areaId);

  function toggleExpanded(index: number) {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleItemUpdate(itemId: string, updates: Partial<AssessmentItem>) {
    updateData((d) => {
      if (!d.gov_compliance_extension) return;
      const searchIn = (sections: ComplianceSection[]) => {
        for (const s of sections) {
          if (s.id !== sectionId) continue;
          const ca = s.capability_areas.find(c => c.id === areaId);
          const item = ca?.items.find(i => i.id === itemId);
          if (item) Object.assign(item, updates);
        }
      };
      searchIn(d.gov_compliance_extension.federal.sections);
      searchIn(d.gov_compliance_extension.state.sections);
    });
  }

  // Focus item from URL param
  useEffect(() => {
    const focusId = searchParams.get('focus');
    if (focusId && area) {
      const idx = area.items.findIndex(i => i.id === focusId);
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
        setFocusedIndex(i => {
          const next = Math.min(i + 1, items.length - 1);
          itemRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          return next;
        });
        break;
      case 'ArrowUp':
      case 'k':
        e.preventDefault();
        setFocusedIndex(i => {
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

  if (!data?.gov_compliance_enabled || !data.gov_compliance_extension) {
    return <div className="text-text-tertiary">Gov Compliance not enabled.</div>;
  }

  if (!section) return <div className="text-text-tertiary">Section not found.</div>;

  // If areaId provided, show item-level scoring
  if (areaId && area) {
    const score = capabilityAreaScore(area);
    const completion = capabilityAreaCompletion(area);
    const pct = completion.total > 0 ? Math.round((completion.scored / completion.total) * 100) : 0;

    return (
      <div>
        <div className="mb-8">
          <p className="text-[11px] text-accent-bright mb-2 uppercase font-semibold tracking-widest">{section.name}</p>
          <h2 className="text-2xl font-bold text-text-primary">{area.name}</h2>
          <div className="flex items-center gap-5 mt-3">
            <span className="text-sm text-text-secondary">{completion.scored} / {completion.total} items scored ({pct}%)</span>
            {score !== null && (
              <span className="text-sm font-medium" style={{ color: getMaturityBand(score).color }}>
                Avg: {score.toFixed(2)} ({SCORE_LABELS[Math.round(score)] ?? ''})
              </span>
            )}
          </div>
        </div>
        <div className="space-y-3">
          {area.items.map((item, i) => {
            const fwItem = frameworkArea?.items?.find((fi: any) => fi.id === item.id);
            return (
              <div key={item.id} ref={(el) => { itemRefs.current[i] = el; }}
                className={focusedIndex === i ? 'item-focused' : ''}
                onClick={() => setFocusedIndex(i)}>
                <AssessmentItemCard
                  item={item}
                  frameworkItem={fwItem}
                  onUpdate={(updates) => handleItemUpdate(item.id, updates)}
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

  if (areaId && !area) {
    return <div className="text-text-tertiary">Capability area not found.</div>;
  }

  // Section overview — show CA cards
  const sectionScore = govComplianceSectionScore(section);
  const sectionBand = sectionScore !== null ? getMaturityBand(sectionScore) : null;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary">{section.name}</h2>
        <div className="flex items-center gap-5 mt-3">
          {sectionScore !== null && (
            <span className="text-sm font-medium" style={{ color: sectionBand!.color }}>
              Score: {sectionScore.toFixed(2)} — {sectionBand!.label}
            </span>
          )}
        </div>
      </div>
      <div className="grid gap-3">
        {section.capability_areas.map(ca => {
          const caScore = capabilityAreaScore(ca);
          const caComp = capabilityAreaCompletion(ca);
          const caPct = caComp.total > 0 ? Math.round((caComp.scored / caComp.total) * 100) : 0;
          return (
            <Link key={ca.id} to={`/gov-compliance/${sectionId}/${ca.id}`}
              className="block p-5 bg-surface-medium border border-border rounded-xl hover:border-accent/40 transition-all">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary">{ca.name}</h3>
                {caScore !== null && (
                  <span className="text-sm font-medium px-2.5 py-1 rounded-lg"
                    style={{ color: getMaturityBand(caScore).color, backgroundColor: getMaturityBand(caScore).color + '12' }}>
                    {caScore.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-1 bg-surface-elevated rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ backgroundColor: caScore !== null ? getMaturityBand(caScore).color : '#1BA1E2', width: `${caPct}%` }} />
                </div>
                <span className="text-[11px] text-text-tertiary font-mono">{caComp.scored}/{caComp.total}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
