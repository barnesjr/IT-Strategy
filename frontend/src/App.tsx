import { useState, useCallback, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { StoreProvider, useStore } from '@/store';
import { Sidebar } from '@/components/Sidebar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { StatsFooter } from '@/components/StatsFooter';
import { ClientInfoPage } from '@/pages/ClientInfo';
import { DashboardPage } from '@/pages/Dashboard';
import { PillarSummaryPage } from '@/pages/PillarSummary';
import { CapabilityAreaPage } from '@/pages/CapabilityArea';
import GovComplianceSummary from '@/pages/GovComplianceSummary';
import GovComplianceSection from '@/pages/GovComplianceSection';
import { findNextUnscored } from '@/hooks/useNextUnscored';
import { ExportPage } from '@/pages/Export';
import { SettingsPage } from '@/pages/Settings';
import { HelpPage } from '@/pages/Help';
import { CommandPalette } from '@/components/CommandPalette';

const SIDEBAR_MIN = 220;
const SIDEBAR_MAX = 480;
const SIDEBAR_DEFAULT = 350;
const SIDEBAR_COLLAPSED = 56;
const STORAGE_KEY = 'it-strategy-sidebar';

function loadSidebarState(): { width: number; collapsed: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { width: SIDEBAR_DEFAULT, collapsed: false };
}

function saveSidebarState(width: number, collapsed: boolean) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ width, collapsed }));
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [displayKey, setDisplayKey] = useState(location.key);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (location.key !== displayKey) {
      setAnimating(true);
      setDisplayKey(location.key);
      const timer = setTimeout(() => setAnimating(false), 150);
      return () => clearTimeout(timer);
    }
  }, [location.key, displayKey]);

  return (
    <div key={displayKey} className={animating ? 'page-enter' : ''}>
      {children}
    </div>
  );
}

function AppContent() {
  const { loading, data } = useStore();
  const navigate = useNavigate();
  const [sidebarState, setSidebarState] = useState(loadSidebarState);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const { width: sidebarWidth, collapsed } = sidebarState;

  const setWidth = useCallback((w: number) => {
    setSidebarState((prev) => {
      const next = { ...prev, width: Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, w)) };
      saveSidebarState(next.width, next.collapsed);
      return next;
    });
  }, []);

  const toggleCollapsed = useCallback(() => {
    setSidebarState((prev) => {
      const next = { ...prev, collapsed: !prev.collapsed };
      saveSidebarState(next.width, next.collapsed);
      return next;
    });
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    startX.current = e.clientX;
    startWidth.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sidebarWidth]);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return;
      const delta = e.clientX - startX.current;
      setWidth(startWidth.current + delta);
    }
    function onMouseUp() {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [setWidth]);

  // Global keyboard shortcuts
  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      // Cmd/Ctrl+K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
      // Cmd/Ctrl+Right for next unscored item
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        const next = findNextUnscored(data);
        if (next) {
          navigate(`${(next as { path: string; itemId: string }).path}?focus=${(next as { path: string; itemId: string }).itemId}`);
        }
      }
    }
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [data, navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-page-bg">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-secondary">Loading assessment...</p>
        </div>
      </div>
    );
  }

  const effectiveWidth = collapsed ? SIDEBAR_COLLAPSED : sidebarWidth;

  return (
    <div className="flex flex-col h-screen bg-page-bg">
      <div className="flex flex-1 min-h-0">
        <Sidebar
          width={effectiveWidth}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />
        {/* Drag handle */}
        {!collapsed && (
          <div
            onMouseDown={onMouseDown}
            className="w-1 shrink-0 cursor-col-resize group relative z-10"
          >
            <div className="absolute inset-y-0 -left-0.5 w-2 group-hover:bg-accent/20 transition-colors" />
          </div>
        )}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-10 py-10 lg:px-16 lg:py-12">
            <Breadcrumb />
            <PageTransition>
              <Routes>
                <Route path="/" element={<ClientInfoPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/pillars/:pillarId" element={<PillarSummaryPage />} />
                <Route path="/pillars/:pillarId/:areaId" element={<CapabilityAreaPage />} />
                <Route path="/gov-compliance" element={<GovComplianceSummary />} />
                <Route path="/gov-compliance/:sectionId" element={<GovComplianceSection />} />
                <Route path="/gov-compliance/:sectionId/:areaId" element={<GovComplianceSection />} />
                <Route path="/export" element={<ExportPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/help" element={<HelpPage />} />
              </Routes>
            </PageTransition>
          </div>
        </main>
      </div>
      <StatsFooter />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </BrowserRouter>
  );
}
