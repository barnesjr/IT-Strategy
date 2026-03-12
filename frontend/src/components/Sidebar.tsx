import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useStore } from '@/store';
import type { Pillar } from '@/types';
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  User,
  Shield,
  Target,
  Building2,
  Headphones,
  Cloud,
  Users,
  Lightbulb,
  FileDown,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  HelpCircle,
} from 'lucide-react';

const PILLAR_ICONS: Record<string, typeof Shield> = {
  'governance': Shield,
  'strategy': Target,
  'enterprise-architecture': Building2,
  'service-management': Headphones,
  'infrastructure-cloud': Cloud,
  'workforce-culture': Users,
  'innovation-digital': Lightbulb,
};

// Temporary scoring stubs until scoring.ts is created in Chunk 4
function pillarCompletion(pillar: Pillar) {
  let scored = 0, total = 0;
  for (const ca of pillar.capability_areas) {
    for (const item of ca.items) {
      total++;
      if (item.score !== null || item.na) scored++;
    }
  }
  return { scored, total };
}

function pillarScore(pillar: Pillar): number | null {
  const scores: number[] = [];
  for (const ca of pillar.capability_areas) {
    for (const item of ca.items) {
      if (item.score !== null && !item.na) scores.push(item.score);
    }
  }
  return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
}

function ProgressRing({ percent, size = 20 }: { percent: number; size?: number }) {
  const r = (size - 3) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2A2A2E" strokeWidth={2} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#1BA1E2"
        strokeWidth={2}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null;
  const colors: Record<number, string> = {
    1: 'bg-red-500/15 text-red-400',
    2: 'bg-orange-500/15 text-orange-400',
    3: 'bg-lime-500/15 text-lime-400',
    4: 'bg-green-500/15 text-green-400',
  };
  const rounded = Math.round(score);
  const colorClass = colors[Math.min(4, Math.max(1, rounded))] ?? 'bg-gray-500/15 text-gray-400';
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${colorClass}`}>
      {score.toFixed(1)}
    </span>
  );
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-all duration-150 ${
    isActive
      ? 'bg-accent/12 text-white font-medium'
      : 'text-text-secondary hover:bg-surface-elevated/60 hover:text-white'
  }`;

const collapsedNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-150 ${
    isActive
      ? 'bg-accent/12 text-white'
      : 'text-text-secondary hover:bg-surface-elevated/60 hover:text-white'
  }`;

function ExpandableSection({
  label,
  icon: Icon,
  basePath,
  areas,
  score,
  completion,
  collapsed,
}: {
  label: string;
  icon: typeof Shield;
  basePath: string;
  areas: { id: string; name: string }[];
  score: number | null;
  completion: { scored: number; total: number };
  collapsed: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const isActive = location.pathname.startsWith(basePath);
  const pct = completion.total > 0 ? (completion.scored / completion.total) * 100 : 0;

  if (collapsed) {
    return (
      <NavLink
        to={basePath}
        title={label}
        className={collapsedNavLinkClass}
      >
        <Icon size={18} className="opacity-70" />
      </NavLink>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-all duration-150 ${
          isActive
            ? 'bg-accent/12 text-white font-medium'
            : 'text-text-secondary hover:bg-surface-elevated/60 hover:text-white'
        }`}
      >
        <Icon size={15} className="shrink-0 opacity-70" />
        <span className="flex-1 text-left truncate">{label}</span>
        <ScoreBadge score={score} />
        <ProgressRing percent={pct} />
        {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
      </button>
      {expanded && (
        <div className="ml-7 mt-1 space-y-0.5 border-l border-border pl-3">
          {areas.map((area) => (
            <NavLink
              key={area.id}
              to={`${basePath}/${area.id}`}
              className={({ isActive: active }) =>
                `block px-2.5 py-1.5 text-xs rounded-md transition-all duration-150 ${
                  active
                    ? 'bg-accent/12 text-white font-medium'
                    : 'text-text-tertiary hover:bg-surface-elevated/40 hover:text-text-secondary'
                }`
              }
            >
              {area.name}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

interface SidebarProps {
  width: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ width, collapsed, onToggleCollapse }: SidebarProps) {
  const { data, saveStatus, updateData } = useStore();

  return (
    <aside
      className="h-screen bg-surface-dark flex flex-col shrink-0 overflow-hidden border-r border-border-subtle transition-[width] duration-200"
      style={{ width }}
    >
      {/* Header */}
      <div className="px-4 py-4 border-b border-border-subtle flex items-center gap-3">
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-semibold text-[15px] tracking-tight truncate">IT Strategy Assessment</h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  saveStatus === 'saving'
                    ? 'bg-yellow-400'
                    : saveStatus === 'saved'
                    ? 'bg-green-400'
                    : saveStatus === 'error'
                    ? 'bg-red-400'
                    : 'bg-text-tertiary'
                }`}
              />
              <span className="text-text-tertiary text-[11px]">
                {saveStatus === 'saving' && 'Saving...'}
                {saveStatus === 'saved' && 'Saved'}
                {saveStatus === 'error' && 'Save failed'}
                {saveStatus === 'idle' && 'Ready'}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-white hover:bg-surface-elevated/60 transition-all"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto py-4 space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
        {collapsed ? (
          /* Collapsed icon-only nav */
          <>
            <NavLink to="/" end title="Client Information" className={collapsedNavLinkClass}>
              <User size={18} className="opacity-70" />
            </NavLink>
            <NavLink to="/dashboard" title="Dashboard" className={collapsedNavLinkClass}>
              <LayoutDashboard size={18} className="opacity-70" />
            </NavLink>

            <div className="py-2">
              <div className="h-px bg-border-subtle mx-1" />
            </div>

            {data?.pillars.map((pillar) => {
              const Icon = PILLAR_ICONS[pillar.id] ?? Shield;
              const comp = pillarCompletion(pillar);
              return (
                <ExpandableSection
                  key={pillar.id}
                  label={pillar.name}
                  icon={Icon}
                  basePath={`/pillars/${pillar.id}`}
                  areas={pillar.capability_areas}
                  score={null}
                  completion={comp}
                  collapsed
                />
              );
            })}

            <div className="py-2">
              <div className="h-px bg-border-subtle mx-1" />
            </div>

            <NavLink to="/export" title="Export" className={collapsedNavLinkClass}>
              <FileDown size={18} className="opacity-70" />
            </NavLink>
            <NavLink to="/settings" title="Settings" className={collapsedNavLinkClass}>
              <Settings size={18} className="opacity-70" />
            </NavLink>
            <NavLink to="/help" title="Help" className={collapsedNavLinkClass}>
              <HelpCircle size={18} className="opacity-70" />
            </NavLink>
          </>
        ) : (
          /* Expanded full nav */
          <>
            <NavLink to="/" end className={navLinkClass}>
              <User size={15} className="opacity-70" />
              Client Information
            </NavLink>

            <NavLink to="/dashboard" className={navLinkClass}>
              <LayoutDashboard size={15} className="opacity-70" />
              Dashboard
            </NavLink>

            <div className="pt-5 pb-1.5 px-2">
              <span className="text-[10px] font-semibold text-accent-bright uppercase tracking-widest">Pillars</span>
            </div>

            {data?.pillars.map((pillar) => {
              const Icon = PILLAR_ICONS[pillar.id] ?? Shield;
              const comp = pillarCompletion(pillar);
              const score = pillarScore(pillar);
              return (
                <ExpandableSection
                  key={pillar.id}
                  label={pillar.name}
                  icon={Icon}
                  basePath={`/pillars/${pillar.id}`}
                  areas={pillar.capability_areas}
                  score={score}
                  completion={comp}
                  collapsed={false}
                />
              );
            })}

            {/* Gov Compliance Module */}
            <div className="px-3 py-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-[11px] font-semibold text-accent-bright uppercase tracking-widest">
                  Gov Compliance
                </span>
                <button
                  onClick={() => updateData((d) => {
                    d.gov_compliance_enabled = !d.gov_compliance_enabled;
                    if (d.gov_compliance_extension) {
                      d.gov_compliance_extension.enabled = !d.gov_compliance_extension.enabled;
                    }
                  })}
                  className={`relative w-8 h-4 rounded-full transition-colors ${
                    data?.gov_compliance_enabled ? 'bg-accent' : 'bg-surface-muted'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                    data?.gov_compliance_enabled ? 'translate-x-4' : ''
                  }`} />
                </button>
              </div>
              {data?.gov_compliance_enabled && data.gov_compliance_extension && (
                <>
                  {/* Federal sub-toggle */}
                  <div className="flex items-center justify-between px-2 mt-2 ml-2">
                    <span className="text-[10px] font-medium text-text-tertiary uppercase">Federal (FITARA)</span>
                    <button onClick={() => updateData((d) => {
                      if (d.gov_compliance_extension) d.gov_compliance_extension.federal.enabled = !d.gov_compliance_extension.federal.enabled;
                    })} className={`relative w-7 h-3.5 rounded-full transition-colors ${
                      data.gov_compliance_extension.federal.enabled ? 'bg-accent/70' : 'bg-surface-muted'
                    }`}>
                      <span className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-full bg-white transition-transform ${
                        data.gov_compliance_extension.federal.enabled ? 'translate-x-3.5' : ''
                      }`} />
                    </button>
                  </div>
                  {data.gov_compliance_extension.federal.enabled &&
                    data.gov_compliance_extension.federal.sections.map(section => (
                      <NavLink key={section.id} to={`/gov-compliance/${section.id}`}
                        className={({ isActive }) => `block ml-4 px-2.5 py-1.5 text-xs rounded-md transition-all ${
                          isActive ? 'bg-accent/12 text-white font-medium' : 'text-text-tertiary hover:bg-surface-elevated/40 hover:text-text-secondary'
                        }`}>
                        {section.name}
                      </NavLink>
                    ))
                  }
                  {/* State sub-toggle */}
                  <div className="flex items-center justify-between px-2 mt-2 ml-2">
                    <span className="text-[10px] font-medium text-text-tertiary uppercase">State (NASCIO)</span>
                    <button onClick={() => updateData((d) => {
                      if (d.gov_compliance_extension) d.gov_compliance_extension.state.enabled = !d.gov_compliance_extension.state.enabled;
                    })} className={`relative w-7 h-3.5 rounded-full transition-colors ${
                      data.gov_compliance_extension.state.enabled ? 'bg-accent/70' : 'bg-surface-muted'
                    }`}>
                      <span className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-full bg-white transition-transform ${
                        data.gov_compliance_extension.state.enabled ? 'translate-x-3.5' : ''
                      }`} />
                    </button>
                  </div>
                  {data.gov_compliance_extension.state.enabled &&
                    data.gov_compliance_extension.state.sections.map(section => (
                      <NavLink key={section.id} to={`/gov-compliance/${section.id}`}
                        className={({ isActive }) => `block ml-4 px-2.5 py-1.5 text-xs rounded-md transition-all ${
                          isActive ? 'bg-accent/12 text-white font-medium' : 'text-text-tertiary hover:bg-surface-elevated/40 hover:text-text-secondary'
                        }`}>
                        {section.name}
                      </NavLink>
                    ))
                  }
                </>
              )}
            </div>

            <div className="pt-5 pb-1.5 px-2">
              <span className="text-[10px] font-semibold text-accent-bright uppercase tracking-widest">Tools</span>
            </div>

            <NavLink to="/export" className={navLinkClass}>
              <FileDown size={15} className="opacity-70" />
              Export
            </NavLink>

            <NavLink to="/settings" className={navLinkClass}>
              <Settings size={15} className="opacity-70" />
              Settings
            </NavLink>

            <NavLink to="/help" className={navLinkClass}>
              <HelpCircle size={15} className="opacity-70" />
              Help
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
