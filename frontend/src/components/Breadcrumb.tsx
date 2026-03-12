import { Link, useParams, useLocation } from 'react-router-dom';
import { useStore } from '@/store';
import { ChevronRight } from 'lucide-react';

export function Breadcrumb() {
  const { pillarId, areaId, sectionId } = useParams();
  const location = useLocation();
  const { data } = useStore();
  if (!data) return null;

  const segments: { label: string; path: string }[] = [];
  const isGovCompliance = location.pathname.startsWith('/gov-compliance');

  if (isGovCompliance && sectionId) {
    segments.push({ label: 'Gov Compliance', path: '/gov-compliance' });
    // Search federal and state sections
    const ext = data.gov_compliance_extension;
    if (ext) {
      const allSections = [...ext.federal.sections, ...ext.state.sections];
      const section = allSections.find(s => s.id === sectionId);
      if (section) {
        segments.push({ label: section.name, path: `/gov-compliance/${sectionId}` });
        if (areaId) {
          const area = section.capability_areas.find(ca => ca.id === areaId);
          if (area) segments.push({ label: area.name, path: `/gov-compliance/${sectionId}/${areaId}` });
        }
      }
    }
  } else if (isGovCompliance) {
    segments.push({ label: 'Gov Compliance', path: '/gov-compliance' });
  } else if (pillarId) {
    segments.push({ label: 'Pillars', path: '/dashboard' });
    const pillar = data.pillars.find((p) => p.id === pillarId);
    if (pillar) {
      segments.push({ label: pillar.name, path: `/pillars/${pillarId}` });
      if (areaId) {
        const area = pillar.capability_areas.find((ca) => ca.id === areaId);
        if (area) segments.push({ label: area.name, path: `/pillars/${pillarId}/${areaId}` });
      }
    }
  }

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 mb-5 text-[11px]">
      <Link to="/dashboard" className="text-text-tertiary hover:text-accent transition-colors">
        Home
      </Link>
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        return (
          <span key={seg.path} className="flex items-center gap-1.5">
            <ChevronRight size={10} className="text-text-tertiary" />
            {isLast ? (
              <span className="text-text-secondary font-medium">{seg.label}</span>
            ) : (
              <Link to={seg.path} className="text-text-tertiary hover:text-accent transition-colors">
                {seg.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
