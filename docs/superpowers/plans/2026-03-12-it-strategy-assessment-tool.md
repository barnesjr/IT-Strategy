# IT Strategy Assessment Tool Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete IT Strategy Assessment Tool by cloning the Zero-Trust assessment tool and adapting it for 7 TOGAF 10-aligned pillars, a sub-toggleable Government Compliance extension, and 8 export types.

**Architecture:** Clone-and-adapt from `/Users/john/Dev/Assessments/Zero-Trust/`. FastAPI backend serves API + built React frontend as static files. React 19 + TypeScript + Tailwind CSS 4 frontend with Recharts for visualization. PyInstaller packages everything into a standalone executable. The Gov Compliance extension uses a novel sub-toggle pattern (main + Federal/State) and contributes to the weighted composite score when enabled.

**Tech Stack:** Python 3 / FastAPI / Uvicorn / Pydantic v2 / openpyxl / docxtpl / python-pptx / matplotlib | React 19 / TypeScript 5.9 / Vite 7 / Tailwind CSS 4 / Recharts / Lucide React / React Router 7

**Reference implementation:** `/Users/john/Dev/Assessments/Zero-Trust/`
**Design spec:** `docs/superpowers/specs/2026-03-12-it-strategy-assessment-tool-design.md`
**Implementation prompt:** `assessment-tool-prompt-it-strategy.md`

---

## File Structure

### File naming convention

Several Zero-Trust files use a `*Page.tsx` suffix (e.g., `CapabilityAreaPage.tsx`, `ExportPage.tsx`, `HelpPage.tsx`). This plan renames them to drop the suffix (`CapabilityArea.tsx`, `Export.tsx`, `Help.tsx`) to match the implementation prompt. When copying from Zero-Trust, rename the file and update all import statements accordingly.

### Files to create (adapted from Zero-Trust)

```
it-strategy/
├── backend/
│   ├── __init__.py                        # Empty init
│   ├── main.py                            # FastAPI app (adapt port 8761-8770, routes)
│   ├── models.py                          # Pydantic models (7 pillars, Gov Compliance)
│   ├── data_manager.py                    # Load/save/backup (adapt for Gov Compliance)
│   └── export_engine.py                   # 8 export generators (5 adapted + 3 new)
├── frontend/
│   ├── package.json                       # Same deps as Zero-Trust
│   ├── vite.config.ts                     # Proxy to port 8761
│   ├── tsconfig.json                      # Same
│   ├── tsconfig.app.json                  # Same
│   ├── tsconfig.node.json                 # Same
│   ├── eslint.config.js                   # Same
│   ├── index.html                         # Same structure
│   └── src/
│       ├── main.tsx                       # Same
│       ├── index.css                      # Adapt theme tokens
│       ├── App.tsx                         # Adapt routes, sidebar key, port
│       ├── store.tsx                       # Same pattern
│       ├── types.ts                        # 7 pillars, Gov Compliance types, new constants
│       ├── api.ts                          # Adapt export types
│       ├── scoring.ts                      # 7 pillars, Gov Compliance composite integration
│       ├── validation.ts                   # Adapt for Gov Compliance
│       ├── hooks/
│       │   └── useNextUnscored.ts          # Adapt for 7 pillars + Gov Compliance
│       ├── components/
│       │   ├── Sidebar.tsx                 # 7 pillars, Gov Compliance sub-toggles
│       │   ├── AssessmentItemCard.tsx       # Same (rubric keys change)
│       │   ├── ScoringWidget.tsx            # Same (score labels change); includes ConfidenceWidget export
│       │   ├── Breadcrumb.tsx              # Adapt for 7 pillars + Gov Compliance
│       │   ├── StatsFooter.tsx             # Same pattern
│       │   ├── CommandPalette.tsx          # Adapt for 7 pillars + Gov Compliance
│       │   └── OnboardingTooltip.tsx       # Adapt localStorage key
│       └── pages/
│           ├── ClientInfo.tsx              # Same
│           ├── Dashboard.tsx               # 7 pillars, Gov Compliance on radar
│           ├── PillarSummary.tsx           # Same pattern
│           ├── CapabilityArea.tsx          # Same pattern
│           ├── GovComplianceSummary.tsx    # New (adapted from ClassifiedExtension)
│           ├── GovComplianceSection.tsx    # New
│           ├── Export.tsx                  # 8 export types
│           ├── Settings.tsx               # 5 weighting models, Gov Compliance toggle
│           └── Help.tsx                   # Adapted content
├── framework/
│   └── assessment-framework.json          # New (~350 + ~60 items, TOGAF 10)
├── build.py                               # Adapt names, ports
├── assessment-tool-macos.spec             # Adapt names
├── assessment-tool-windows.spec           # Adapt names
├── requirements.txt                       # Same as Zero-Trust
├── README.txt                             # Adapted content
├── .gitignore                             # Same as Zero-Trust
└── .github/
    └── workflows/
        ├── ci.yml                         # New
        └── release.yml                    # Adapt names
```

---

## Chunk 1: Project Scaffolding

### Task 1.1: Initialize project files

**Files:**
- Copy from Zero-Trust and adapt: `.gitignore`, `requirements.txt`
- Create: `backend/__init__.py`

- [ ] **Step 1: Copy .gitignore from Zero-Trust**

Copy `/Users/john/Dev/Assessments/Zero-Trust/.gitignore` to project root. No changes needed.

- [ ] **Step 2: Copy requirements.txt from Zero-Trust**

Copy `/Users/john/Dev/Assessments/Zero-Trust/requirements.txt` to project root. (Note: in Zero-Trust this may be at the root or in `backend/` — check both locations.) Same dependencies.

- [ ] **Step 3: Create backend/__init__.py**

Create empty `backend/__init__.py`.

- [ ] **Step 4: Commit scaffolding files**

```bash
git add .gitignore requirements.txt backend/__init__.py
git commit -m "chore: add project scaffolding files"
```

### Task 1.2: Set up backend skeleton

**Files:**
- Create: `backend/main.py` (adapted from Zero-Trust)

- [ ] **Step 1: Copy and adapt main.py from Zero-Trust**

Copy `/Users/john/Dev/Assessments/Zero-Trust/backend/main.py`. Make these changes:
- Port range: `8741-8750` → `8761-8770`
- Remove cross-cutting and classified references from any route descriptions
- Keep all route handlers as stubs for now (they'll be filled in Task 2)

Key adaptations in the file:
```python
# Change port range
def find_available_port(start: int = 8761, end: int = 8770) -> int:
```

- [ ] **Step 2: Verify backend starts**

```bash
cd /Users/john/Dev/Assessments/IT-Strategy
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 -m backend.main
```
Expected: Server starts on port 8761, logs port info. Ctrl+C to stop.

- [ ] **Step 3: Commit**

```bash
git add backend/main.py
git commit -m "feat: add FastAPI backend skeleton with port 8761"
```

### Task 1.3: Set up frontend

**Files:**
- Copy and adapt from Zero-Trust: `frontend/package.json`, `frontend/vite.config.ts`, `frontend/tsconfig.json`, `frontend/tsconfig.app.json`, `frontend/index.html`, `frontend/src/main.tsx`, `frontend/src/index.css`

- [ ] **Step 1: Copy frontend config files from Zero-Trust**

Copy these files from `/Users/john/Dev/Assessments/Zero-Trust/frontend/`:
- `package.json` — change `name` to `"it-strategy-assessment"`, keep all deps identical
- `vite.config.ts` — change proxy target port to `8761`. Verify `resolve.alias` has `@` → `./src/` for path aliases used in imports
- `tsconfig.json` — no changes
- `tsconfig.app.json` — verify `paths` has `@/*` → `./src/*` for TypeScript path alias resolution
- `tsconfig.node.json` — no changes
- `eslint.config.js` — no changes
- `index.html` — change `<title>` to `"IT Strategy Assessment Tool"`

**Note:** Tailwind CSS 4 does not use a `tailwind.config.ts` file. Configuration is done via `@theme` blocks in `index.css`. Do NOT create a `tailwind.config.ts`.

- [ ] **Step 2: Copy and adapt frontend source entry files**

Copy from Zero-Trust:
- `frontend/src/main.tsx` — no changes
- `frontend/src/index.css` — adapt:
  - Change localStorage key references from `zt-` to `it-strategy-`
  - Rename score color CSS variables to match IT-Strategy terminology: `--color-score-traditional` → `--color-score-initial`, `--color-score-initial` → `--color-score-developing`, `--color-score-advanced` → `--color-score-established`, `--color-score-optimal` → `--color-score-optimizing`
  - Rename band color variables similarly
  - Keep all actual color hex values identical (same design system)

- [ ] **Step 3: Create minimal App.tsx placeholder**

Create `frontend/src/App.tsx` with a simple placeholder:
```tsx
export default function App() {
  return <div className="min-h-screen bg-page-bg text-text-primary p-8">
    <h1 className="text-2xl font-bold">IT Strategy Assessment Tool</h1>
    <p className="text-text-secondary mt-2">Loading...</p>
  </div>;
}
```

- [ ] **Step 4: Install dependencies and verify frontend builds**

```bash
cd /Users/john/Dev/Assessments/IT-Strategy/frontend
npm install
npm run build
```
Expected: Build succeeds, output in `../backend/static/`

- [ ] **Step 5: Commit frontend setup**

```bash
cd /Users/john/Dev/Assessments/IT-Strategy
git add frontend/ backend/static/
git commit -m "feat: add frontend scaffolding with Vite + React + Tailwind"
```

### Task 1.4: Set up build.py

**Files:**
- Create: `build.py` (adapted from Zero-Trust)

- [ ] **Step 1: Copy and adapt build.py from Zero-Trust**

Copy `/Users/john/Dev/Assessments/Zero-Trust/build.py`. Adapt:
- Port references: `8741` → `8761`
- Distribution name: `ZeroTrustAssessment` → `ITStrategyAssessment`
- Spec file names remain the same pattern: `assessment-tool-macos.spec`, `assessment-tool-windows.spec`

- [ ] **Step 2: Verify dev mode starts both servers**

```bash
cd /Users/john/Dev/Assessments/IT-Strategy
source .venv/bin/activate
python3 build.py --dev
```
Expected: Backend starts on 8761, Vite dev server on 5173. Browser opens. Ctrl+C stops both.

- [ ] **Step 3: Verify frontend build mode**

```bash
python3 build.py --frontend
```
Expected: Frontend builds to `backend/static/`

- [ ] **Step 4: Commit**

```bash
git add build.py
git commit -m "feat: add build.py with dev/frontend/dist modes"
```

---

## Chunk 2: Data Model & Framework

### Task 2.1: Backend Pydantic models

**Files:**
- Create: `backend/models.py` (adapted from Zero-Trust)

- [ ] **Step 1: Create models.py with IT-Strategy data model**

Copy `/Users/john/Dev/Assessments/Zero-Trust/backend/models.py`. Adapt:

Remove: `CrossCuttingCapability`, `ClassifiedPillar`, `ClassifiedExtension`
Add: `ComplianceSection`, `ComplianceSubModule`, `GovComplianceExtension`

Key model changes:
```python
# Remove
class CrossCuttingCapability(BaseModel): ...
class ClassifiedPillar(BaseModel): ...
class ClassifiedExtension(BaseModel): ...

# Add
class ComplianceSection(BaseModel):
    id: str
    name: str
    capability_areas: list[CapabilityArea] = Field(default_factory=list)

class ComplianceSubModule(BaseModel):
    enabled: bool = False
    sections: list[ComplianceSection] = Field(default_factory=list)

class GovComplianceExtension(BaseModel):
    enabled: bool = False
    federal: ComplianceSubModule = Field(default_factory=ComplianceSubModule)
    state: ComplianceSubModule = Field(default_factory=ComplianceSubModule)

# Update ScoringConfig default weights
class ScoringConfig(BaseModel):
    weighting_model: str = "balanced"
    pillar_weights: dict[str, float] = Field(default_factory=lambda: {
        "governance": 0.15, "strategy": 0.15, "enterprise-architecture": 0.15,
        "service-management": 0.14, "infrastructure-cloud": 0.14,
        "workforce-culture": 0.13, "innovation-digital": 0.14
    })
    custom_weights: Optional[dict[str, float]] = None

# Update AssessmentData
class AssessmentData(BaseModel):
    client_info: ClientInfo = Field(default_factory=ClientInfo)
    assessment_metadata: AssessmentMetadata = Field(default_factory=AssessmentMetadata)
    scoring_config: ScoringConfig = Field(default_factory=ScoringConfig)
    pillars: list[Pillar] = Field(default_factory=list)
    gov_compliance_enabled: bool = False          # Authoritative toggle
    gov_compliance_extension: Optional[GovComplianceExtension] = None
    target_scores: dict[str, float] = Field(default_factory=dict)
```

**Note:** `AssessmentData.gov_compliance_enabled` is the authoritative field. `GovComplianceExtension.enabled` must always mirror it. The sidebar toggle sets both simultaneously.

- [ ] **Step 2: Verify models import cleanly**

```bash
cd /Users/john/Dev/Assessments/IT-Strategy
source .venv/bin/activate
python3 -c "from backend.models import AssessmentData; print(AssessmentData().model_dump_json(indent=2)[:200])"
```
Expected: Prints JSON with empty pillars, no errors.

- [ ] **Step 3: Commit**

```bash
git add backend/models.py
git commit -m "feat: add Pydantic models for IT-Strategy with Gov Compliance extension"
```

### Task 2.2: Data manager

**Files:**
- Create: `backend/data_manager.py` (adapted from Zero-Trust)

- [ ] **Step 1: Copy and adapt data_manager.py**

Copy `/Users/john/Dev/Assessments/Zero-Trust/backend/data_manager.py`. Adapt:
- Remove cross-cutting and classified extension initialization
- Add Gov Compliance extension initialization from framework
- The `create_empty_assessment()` method should:
  1. Create pillars from framework (7 pillars with CAs and items)
  2. Create Gov Compliance extension from framework (disabled by default)
  3. Set default target scores (3.0 per pillar)

Key adaptation in `create_empty_assessment()`:
```python
# Initialize Gov Compliance from framework
gov_ext = framework_data.get("gov_compliance_extension", {})
federal_sections = []
for section in gov_ext.get("federal", {}).get("sections", []):
    # ... create empty items for each section's capability areas
state_sections = []
for section in gov_ext.get("state", {}).get("sections", []):
    # ... same pattern

assessment.gov_compliance_extension = GovComplianceExtension(
    enabled=False,
    federal=ComplianceSubModule(enabled=False, sections=federal_sections),
    state=ComplianceSubModule(enabled=False, sections=state_sections),
)
```

- [ ] **Step 2: Verify data manager loads and creates empty assessment**

```bash
python3 -c "
from backend.data_manager import DataManager
dm = DataManager()
# Will fail until framework exists, but module should import cleanly
print('DataManager imported successfully')
"
```

- [ ] **Step 3: Commit**

```bash
git add backend/data_manager.py
git commit -m "feat: add data manager with Gov Compliance initialization"
```

### Task 2.3: Frontend TypeScript types

**Files:**
- Create: `frontend/src/types.ts` (adapted from Zero-Trust)

- [ ] **Step 1: Create types.ts with IT-Strategy interfaces and constants**

Copy `/Users/john/Dev/Assessments/Zero-Trust/frontend/src/types.ts`. Adapt:

Remove: `CrossCuttingCapability`, `ClassifiedExtension`, `ClassifiedPillar`, cross-cutting framework types
Add: `ComplianceSection`, `ComplianceSubModule`, `GovComplianceExtension`

Update constants:
```typescript
export const SCORE_LABELS: Record<number, string> = {
  1: "Initial", 2: "Developing", 3: "Established", 4: "Optimizing"
};
// SCORE_COLORS stay the same

export const WEIGHTING_MODELS: Record<string, { label: string; weights: Record<string, number> }> = {
  "balanced":         {label:"Balanced",         weights:{"governance":0.143,"strategy":0.143,"enterprise-architecture":0.143,"service-management":0.143,"infrastructure-cloud":0.143,"workforce-culture":0.143,"innovation-digital":0.143}},
  "strategy_heavy":   {label:"Strategy-Heavy",   weights:{"governance":0.18,"strategy":0.20,"enterprise-architecture":0.18,"service-management":0.12,"infrastructure-cloud":0.12,"workforce-culture":0.10,"innovation-digital":0.10}},
  "operations_heavy": {label:"Operations-Heavy", weights:{"governance":0.12,"strategy":0.10,"enterprise-architecture":0.12,"service-management":0.20,"infrastructure-cloud":0.20,"workforce-culture":0.14,"innovation-digital":0.12}},
  "modernization":    {label:"Modernization",    weights:{"governance":0.10,"strategy":0.12,"enterprise-architecture":0.14,"service-management":0.12,"infrastructure-cloud":0.20,"workforce-culture":0.12,"innovation-digital":0.20}},
  "governance_first": {label:"Governance-First",  weights:{"governance":0.22,"strategy":0.14,"enterprise-architecture":0.20,"service-management":0.12,"infrastructure-cloud":0.10,"workforce-culture":0.12,"innovation-digital":0.10}}
};
```

Update framework types — rubric keys change:
```typescript
export interface FrameworkItem {
  id: string;
  text: string;
  rubric: {
    initial: string;
    developing: string;
    established: string;
    optimizing: string;
  };
}
```

Update `AssessmentData` interface:
```typescript
export interface AssessmentData {
  client_info: ClientInfo;
  assessment_metadata: AssessmentMetadata;
  scoring_config: ScoringConfig;
  pillars: Pillar[];
  gov_compliance_enabled: boolean;
  gov_compliance_extension: GovComplianceExtension | null;
  target_scores: Record<string, number>;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/john/Dev/Assessments/IT-Strategy/frontend
npx tsc --noEmit src/types.ts
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/john/Dev/Assessments/IT-Strategy
git add frontend/src/types.ts
git commit -m "feat: add TypeScript types for IT-Strategy with Gov Compliance"
```

### Task 2.4: Framework JSON

**Files:**
- Create: `framework/assessment-framework.json`

This is the largest single artifact. Generate ~350 assessment items across 7 pillars + ~60 Gov Compliance items, all with 4-level rubrics aligned to TOGAF 10.

- [ ] **Step 1: Create framework directory**

```bash
mkdir -p /Users/john/Dev/Assessments/IT-Strategy/framework
```

- [ ] **Step 2: Generate framework JSON**

Create `framework/assessment-framework.json` following the structure in the implementation prompt Section 11. The JSON must include:

```json
{
  "version": "1.0",
  "framework_alignment": "TOGAF 10",
  "pillars": [
    {
      "id": "governance",
      "name": "Governance & Oversight",
      "weight": 0.15,
      "capability_areas": [
        {
          "id": "governance-ca1",
          "name": "IT Governance Structure",
          "items": [
            {
              "id": "governance-1-1",
              "text": "...",
              "rubric": {
                "initial": "...",
                "developing": "...",
                "established": "...",
                "optimizing": "..."
              }
            }
          ]
        }
      ]
    }
  ],
  "gov_compliance_extension": {
    "federal": { "sections": [...] },
    "state": { "sections": [...] }
  },
  "weighting_models": { ... }
}
```

**Content targets:**
- Governance & Oversight: ~50 items across 7 CAs
- Strategy & Planning: ~50 items across 7 CAs
- Enterprise Architecture: ~50 items across 7 CAs
- Service Management: ~50 items across 7 CAs
- Infrastructure & Cloud: ~50 items across 7 CAs
- Workforce & Culture: ~50 items across 7 CAs
- Innovation & Digital: ~50 items across 7 CAs
- Federal (4 sections): ~40 items
- State (3 sections): ~20 items

Each item needs a meaningful `text` (assessment question) and 4-level `rubric` with distinct descriptions per maturity level. Reference the implementation prompt Section 11 for topic guidance per pillar.

- [ ] **Step 3: Validate framework JSON structure**

```bash
cd /Users/john/Dev/Assessments/IT-Strategy
source .venv/bin/activate
python3 -c "
import json
with open('framework/assessment-framework.json') as f:
    fw = json.load(f)
pillars = fw['pillars']
print(f'Pillars: {len(pillars)}')
for p in pillars:
    items = sum(len(ca['items']) for ca in p['capability_areas'])
    print(f'  {p[\"name\"]}: {len(p[\"capability_areas\"])} CAs, {items} items')

ext = fw['gov_compliance_extension']
fed = ext['federal']['sections']
state = ext['state']['sections']
fed_items = sum(len(ca['items']) for s in fed for ca in s['capability_areas'])
state_items = sum(len(ca['items']) for s in state for ca in s['capability_areas'])
print(f'Federal: {len(fed)} sections, {fed_items} items')
print(f'State: {len(state)} sections, {state_items} items')
print(f'Total: {sum(sum(len(ca[\"items\"]) for ca in p[\"capability_areas\"]) for p in pillars) + fed_items + state_items}')
"
```
Expected: ~350 pillar items + ~60 extension items = ~410 total.

- [ ] **Step 4: Commit**

```bash
git add framework/
git commit -m "feat: add TOGAF 10 assessment framework with 7 pillars and Gov Compliance extension"
```

### Task 2.5: Wire up API routes

**Files:**
- Modify: `backend/main.py`

- [ ] **Step 1: Complete API route implementations in main.py**

Update `backend/main.py` to fully implement:
- `GET /api/assessment` — loads via DataManager
- `PUT /api/assessment` — saves via DataManager
- `GET /api/framework` — loads framework JSON
- `POST /api/export/{type}` — stub (returns error for now, implemented in Chunk 7)
- SPA fallback route for all non-API paths

Reference the Zero-Trust `main.py` for exact patterns. Key differences:
- Import from `backend.models` (IT-Strategy models)
- Port range 8761-8770
- Export types list: `["findings","executive-summary","gap-analysis","workbook","outbrief","heatmap","quick-wins","compliance-mapping","all"]`

- [ ] **Step 2: Verify API works end-to-end**

```bash
cd /Users/john/Dev/Assessments/IT-Strategy
source .venv/bin/activate
python3 -m backend.main &
sleep 2
# Test framework endpoint
curl -s http://localhost:8761/api/framework | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Framework: {len(d[\"pillars\"])} pillars')"
# Test assessment endpoint
curl -s http://localhost:8761/api/assessment | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Assessment: {len(d[\"pillars\"])} pillars, gov_compliance_enabled={d[\"gov_compliance_enabled\"]}')"
kill %1
```
Expected: Framework returns 7 pillars. Assessment returns 7 pillars with gov_compliance_enabled=false.

- [ ] **Step 3: Commit**

```bash
git add backend/main.py
git commit -m "feat: wire up API routes for assessment, framework, and export"
```

---

## Chunk 3: State Management & Core Layout

### Task 3.1: API client and store

**Files:**
- Create: `frontend/src/api.ts` (adapted from Zero-Trust)
- Create: `frontend/src/store.tsx` (adapted from Zero-Trust)

- [ ] **Step 1: Create api.ts**

Copy `/Users/john/Dev/Assessments/Zero-Trust/frontend/src/api.ts`. Adapt:
- Update `ExportType` to include all 8 types + 'all':
```typescript
export type ExportType = 'findings' | 'executive-summary' | 'gap-analysis' | 'workbook' | 'outbrief' | 'heatmap' | 'quick-wins' | 'compliance-mapping' | 'all';
```

- [ ] **Step 2: Create store.tsx**

Copy `/Users/john/Dev/Assessments/Zero-Trust/frontend/src/store.tsx`. No structural changes needed — same Context + debounced save pattern. The types imported will come from the updated `types.ts`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/api.ts frontend/src/store.tsx
git commit -m "feat: add API client and React Context store with auto-save"
```

### Task 3.2: App layout with router

**Files:**
- Modify: `frontend/src/App.tsx` (replace placeholder)

- [ ] **Step 1: Create full App.tsx with routing and sidebar layout**

Copy `/Users/john/Dev/Assessments/Zero-Trust/frontend/src/App.tsx`. Adapt:
- `STORAGE_KEY`: `'zt-sidebar'` → `'it-strategy-sidebar'`
- Remove cross-cutting routes (`/cross-cutting/*`)
- Remove classified route (`/classified`)
- Add Gov Compliance routes:
```tsx
<Route path="/gov-compliance" element={<GovComplianceSummary />} />
<Route path="/gov-compliance/:sectionId" element={<GovComplianceSection />} />
<Route path="/gov-compliance/:sectionId/:areaId" element={<GovComplianceSection />} />
```
- Update pillar routes (same pattern, but pages import from IT-Strategy pages)
- Keep sidebar resize logic, keyboard shortcuts (Cmd+K, Cmd+Right), PageTransition component

For now, create placeholder page components that return simple divs so routes don't break:
```tsx
// Temporary placeholders until real pages are built
const PlaceholderPage = ({ name }: { name: string }) => (
  <div className="p-8 text-text-secondary">{name} — coming soon</div>
);
```

- [ ] **Step 2: Verify app renders with routing**

```bash
cd /Users/john/Dev/Assessments/IT-Strategy
python3 build.py --frontend
source .venv/bin/activate
python3 -m backend.main
```
Expected: Browser opens, shows app shell with sidebar placeholder. Navigate between routes.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat: add App layout with routing and sidebar resize"
```

### Task 3.3: Sidebar component

**Files:**
- Create: `frontend/src/components/Sidebar.tsx` (adapted from Zero-Trust)

- [ ] **Step 1: Create Sidebar with 7 pillars and Gov Compliance sub-toggles**

Copy `/Users/john/Dev/Assessments/Zero-Trust/frontend/src/components/Sidebar.tsx`. Major adaptations:

**Remove:** Cross-cutting section, Classified extension toggle
**Update:** Pillar icons map for 7 IT-Strategy pillars:
```tsx
const PILLAR_ICONS: Record<string, React.FC<any>> = {
  'governance': Shield,
  'strategy': Target,
  'enterprise-architecture': Building2,
  'service-management': Headphones,
  'infrastructure-cloud': Cloud,
  'workforce-culture': Users,
  'innovation-digital': Lightbulb,
};
```

**Add:** Gov Compliance section with 3-level toggles (adapted from ITSM-ITIL's ITIL4 toggle pattern):
```tsx
{/* Gov Compliance Module */}
{!collapsed && (
  <div className="px-3 py-3">
    {/* Main toggle */}
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

    {/* Federal sub-toggle + sections */}
    {data?.gov_compliance_enabled && data.gov_compliance_extension && (
      <>
        <div className="flex items-center justify-between px-2 mt-2 ml-2">
          <span className="text-[10px] font-medium text-text-tertiary uppercase">Federal (FITARA)</span>
          <button onClick={() => updateData((d) => {
            if (d.gov_compliance_extension) d.gov_compliance_extension.federal.enabled = !d.gov_compliance_extension.federal.enabled;
          })} className={/* sub-toggle styling */} />
        </div>
        {data.gov_compliance_extension.federal.enabled &&
          data.gov_compliance_extension.federal.sections.map(section => (
            <NavLink key={section.id} to={`/gov-compliance/${section.id}`} className={navLinkClass}>
              {section.name}
            </NavLink>
          ))
        }
        {/* State sub-toggle + sections — same pattern */}
      </>
    )}
  </div>
)}
```

- [ ] **Step 2: Build and verify sidebar renders**

```bash
cd /Users/john/Dev/Assessments/IT-Strategy
python3 build.py --frontend
```
Expected: Builds without errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Sidebar.tsx
git commit -m "feat: add sidebar with 7 pillars and Gov Compliance sub-toggles"
```

### Task 3.4: Client Info and basic Dashboard pages

**Files:**
- Create: `frontend/src/pages/ClientInfo.tsx` (copy from Zero-Trust)
- Create: `frontend/src/pages/Dashboard.tsx` (basic version, charts added in Chunk 5)

- [ ] **Step 1: Copy ClientInfo.tsx from Zero-Trust**

Copy directly — same fields (name, industry, assessment_date, assessor), same UI.

- [ ] **Step 2: Create basic Dashboard.tsx**

Start with a simplified version showing:
- Overall composite score (placeholder calculation)
- Pillar score cards (7 pillars)
- Completion percentage
- Charts will be added in Chunk 5

- [ ] **Step 3: Update App.tsx to import real pages**

Replace placeholder imports with actual page components for ClientInfo and Dashboard.

- [ ] **Step 4: Verify navigation works**

```bash
python3 build.py --dev
```
Navigate between Client Info and Dashboard. Verify data entry in Client Info persists.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/ClientInfo.tsx frontend/src/pages/Dashboard.tsx frontend/src/App.tsx
git commit -m "feat: add Client Info and basic Dashboard pages"
```

---

## Chunk 4: Assessment Scoring UI

### Task 4.1: Scoring engine

**Files:**
- Create: `frontend/src/scoring.ts` (adapted from Zero-Trust)

- [ ] **Step 1: Create scoring.ts with IT-Strategy calculations**

Copy `/Users/john/Dev/Assessments/Zero-Trust/frontend/src/scoring.ts`. Adapt:

**Remove:** `crossCuttingScore()`, `crossCuttingCompletion()`, `classifiedPostureIndex()`
**Add:** Gov Compliance scoring functions + composite integration

```typescript
// Existing (unchanged logic, different types)
export function averageScore(items: AssessmentItem[]): number | null { ... }
export function capabilityAreaScore(ca: CapabilityArea): number | null { ... }
export function capabilityAreaCompletion(ca: CapabilityArea): { scored: number; total: number } { ... }
export function pillarScore(pillar: Pillar): number | null { ... }
export function pillarCompletion(pillar: Pillar): { scored: number; total: number } { ... }

// New: Gov Compliance scoring
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

// Updated: Weighted composite includes Gov Compliance when enabled
export function weightedCompositeScore(data: AssessmentData): number | null {
  let totalWeight = 0;
  let weightedSum = 0;

  // Pillar scores
  const sumOfPillarWeights = data.pillars.reduce((s, p) => s + p.weight, 0);
  const govEnabled = data.gov_compliance_enabled && data.gov_compliance_extension;
  const scaleFactor = govEnabled ? 0.9 / sumOfPillarWeights : 1;

  for (const pillar of data.pillars) {
    const score = pillarScore(pillar);
    if (score !== null) {
      const w = pillar.weight * scaleFactor;
      weightedSum += score * w;
      totalWeight += w;
    }
  }

  // Gov Compliance contribution (weight = 0.10)
  if (govEnabled) {
    const gcScore = govComplianceOverallScore(data);
    if (gcScore !== null) {
      weightedSum += gcScore * 0.10;
      totalWeight += 0.10;
    }
  }

  return totalWeight > 0 ? weightedSum / totalWeight : null;
}

// Updated: Overall completion includes Gov Compliance
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/john/Dev/Assessments/IT-Strategy/frontend
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd /Users/john/Dev/Assessments/IT-Strategy
git add frontend/src/scoring.ts
git commit -m "feat: add scoring engine with Gov Compliance composite integration"
```

### Task 4.2: Scoring and confidence widgets

**Files:**
- Create: `frontend/src/components/ScoringWidget.tsx` (adapted from Zero-Trust — this file also exports `ConfidenceWidget`)

**Note:** In Zero-Trust, `ConfidenceWidget` is defined inside `ScoringWidget.tsx` and exported from it. It is NOT a separate file. Keep this co-location pattern.

- [ ] **Step 1: Copy and adapt ScoringWidget.tsx**

Copy from Zero-Trust. Update score level labels in tooltips:
- 1: "Initial" (was "Traditional")
- 2: "Developing" (was "Initial")
- 3: "Established" (was "Advanced")
- 4: "Optimizing" (was "Optimal")

ConfidenceWidget (H/M/L buttons) needs no changes.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/ScoringWidget.tsx
git commit -m "feat: add scoring and confidence widget components"
```

### Task 4.3: Assessment item card

**Files:**
- Create: `frontend/src/components/AssessmentItemCard.tsx` (adapted from Zero-Trust)

- [ ] **Step 1: Copy and adapt AssessmentItemCard.tsx**

Copy from Zero-Trust. Adapt rubric level keys and labels:
- `traditional` → `initial`
- `initial` → `developing`
- `advanced` → `established`
- `optimal` → `optimizing`

In the rubric display section:
```tsx
const RUBRIC_LEVELS = [
  { key: 'initial', label: 'Initial', color: '#ef4444' },
  { key: 'developing', label: 'Developing', color: '#f97316' },
  { key: 'established', label: 'Established', color: '#84cc16' },
  { key: 'optimizing', label: 'Optimizing', color: '#22c55e' },
];
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/AssessmentItemCard.tsx
git commit -m "feat: add assessment item card with TOGAF rubric levels"
```

### Task 4.4: Breadcrumb component

**Files:**
- Create: `frontend/src/components/Breadcrumb.tsx` (adapted from Zero-Trust)

- [ ] **Step 1: Copy and adapt Breadcrumb.tsx**

Copy from Zero-Trust. Remove cross-cutting breadcrumb logic. Add Gov Compliance breadcrumb support:
- `/gov-compliance` → "Gov Compliance"
- `/gov-compliance/:sectionId` → "Gov Compliance > Section Name"
- `/gov-compliance/:sectionId/:areaId` → "Gov Compliance > Section Name > Area Name"

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Breadcrumb.tsx
git commit -m "feat: add breadcrumb navigation component"
```

### Task 4.5: Pillar summary and capability area pages

**Files:**
- Create: `frontend/src/pages/PillarSummary.tsx` (adapted from Zero-Trust)
- Create: `frontend/src/pages/CapabilityArea.tsx` (adapted from Zero-Trust)

- [ ] **Step 1: Copy and adapt PillarSummary.tsx**

Copy from Zero-Trust. Remove cross-cutting capability handling — only pillars. Update route references to use `/pillars/`.

- [ ] **Step 2: Copy and adapt CapabilityArea.tsx**

Copy from Zero-Trust. Remove cross-cutting route handling. Keep:
- Keyboard navigation (1-4 score, H/M/L confidence, N for N/A, arrows)
- URL-based focus (`?focus=itemId`)
- Item expand/collapse
- Validation issue display per item

- [ ] **Step 3: Update App.tsx to wire up all pages**

Replace remaining placeholder pages with real components. Ensure all imports resolve.

- [ ] **Step 4: Verify scoring works end-to-end**

```bash
python3 build.py --dev
```
Navigate to a pillar → capability area → score items. Verify:
- Scores appear in sidebar badges
- Progress rings update
- Auto-save works (check terminal for PUT requests)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/PillarSummary.tsx frontend/src/pages/CapabilityArea.tsx frontend/src/App.tsx
git commit -m "feat: add pillar summary and capability area scoring pages"
```

---

## Chunk 5: Dashboard & Charts

### Task 5.1: Full dashboard with charts

**Files:**
- Modify: `frontend/src/pages/Dashboard.tsx` (replace basic version)

- [ ] **Step 1: Build full Dashboard with Recharts**

Copy `/Users/john/Dev/Assessments/Zero-Trust/frontend/src/pages/Dashboard.tsx`. Major adaptations:

**Remove:** Cross-cutting summary section, Classified Posture Index
**Update:**
- Radar chart: 7 axes (one per pillar), optionally 8 when Gov Compliance enabled
- Bar chart: 7 bars for pillar scores with maturity band colors
- Score cards: 7 pillars instead of 5
- Composite score uses updated `weightedCompositeScore()` which includes Gov Compliance
- Maturity band display using `getMaturityBand()`

Radar chart data construction:
```tsx
const radarData = data.pillars.map(p => ({
  subject: p.name,
  score: pillarScore(p) ?? 0,
  target: data.target_scores[p.id] ?? 3.0,
  fullMark: 4,
}));

// Add Gov Compliance axis when enabled
if (data.gov_compliance_enabled) {
  const gcScore = govComplianceOverallScore(data);
  radarData.push({
    subject: 'Gov Compliance',
    score: gcScore ?? 0,
    target: 3.0,
    fullMark: 4,
  });
}
```

- [ ] **Step 2: Verify dashboard renders with charts**

Score a few items, then navigate to Dashboard. Verify radar chart and bar chart display correctly.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Dashboard.tsx
git commit -m "feat: add full dashboard with radar chart, bar chart, and maturity bands"
```

### Task 5.2: Stats footer

**Files:**
- Create: `frontend/src/components/StatsFooter.tsx` (adapted from Zero-Trust)

- [ ] **Step 1: Copy and adapt StatsFooter.tsx**

Copy from Zero-Trust. Adapt `overallCompletion()` to use updated function that includes Gov Compliance. Remove cross-cutting and classified references.

- [ ] **Step 2: Wire into App.tsx**

Ensure StatsFooter is rendered at the bottom of the main content area (should already be in App.tsx from Zero-Trust copy).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/StatsFooter.tsx
git commit -m "feat: add stats footer with progress bar and save status"
```

---

## Chunk 6: Government Compliance Extension

### Task 6.1: Gov Compliance summary page

**Files:**
- Create: `frontend/src/pages/GovComplianceSummary.tsx`

- [ ] **Step 1: Create GovComplianceSummary page**

Adapted from Zero-Trust's `ClassifiedExtension.tsx` but with richer structure. Shows:
- Guard clause: if Gov Compliance not enabled, show enable prompt with link to Settings
- Federal section overview (when enabled): 4 sections with scores and completion
- State section overview (when enabled): 3 sections with scores and completion
- Overall Gov Compliance score

```tsx
export default function GovComplianceSummary() {
  const { data, framework, updateData } = useStore();

  if (!data?.gov_compliance_enabled || !data.gov_compliance_extension) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-3">Government Compliance Module</h2>
        <p className="text-sm text-text-tertiary mb-6">
          Adds Federal (FITARA/GAO ITIM) and State (NASCIO) compliance assessments.
          Enable in the sidebar to begin.
        </p>
      </div>
    );
  }

  const ext = data.gov_compliance_extension;
  // Render Federal sections if enabled, State sections if enabled
  // Each section shows: name, score badge, completion ring, link to section detail
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/GovComplianceSummary.tsx
git commit -m "feat: add Gov Compliance summary page"
```

### Task 6.2: Gov Compliance section page

**Files:**
- Create: `frontend/src/pages/GovComplianceSection.tsx`

- [ ] **Step 1: Create GovComplianceSection page**

Handles both routes:
- `/gov-compliance/:sectionId` — shows section overview with CAs
- `/gov-compliance/:sectionId/:areaId` — shows capability area items (reuses AssessmentItemCard)

Pattern: look up section by ID across both federal and state sub-modules, then either show CA list or item-level scoring.

```tsx
export default function GovComplianceSection() {
  const { sectionId, areaId } = useParams();
  const { data, framework, updateData } = useStore();

  // Guard
  if (!data?.gov_compliance_enabled || !data.gov_compliance_extension) {
    return <div className="text-text-tertiary">Gov Compliance not enabled.</div>;
  }

  // Find section in federal or state
  const ext = data.gov_compliance_extension;
  const allSections = [
    ...(ext.federal.enabled ? ext.federal.sections : []),
    ...(ext.state.enabled ? ext.state.sections : []),
  ];
  const section = allSections.find(s => s.id === sectionId);

  if (!section) return <div>Section not found.</div>;

  // If areaId provided, show item-level scoring (same as CapabilityArea page)
  if (areaId) {
    const area = section.capability_areas.find(ca => ca.id === areaId);
    // Render AssessmentItemCards with keyboard navigation
    // Update handler navigates: gov_compliance_extension → federal/state → section → CA → item
  }

  // Otherwise show section overview with CA cards
}
```

The update handler for Gov Compliance items:
```tsx
onUpdate={(updates) => {
  updateData((d) => {
    if (!d.gov_compliance_extension) return;
    // Search in both federal and state
    const searchIn = (subModule: ComplianceSubModule) => {
      for (const s of subModule.sections) {
        if (s.id !== sectionId) continue;
        const ca = s.capability_areas.find(c => c.id === areaId);
        const item = ca?.items.find(i => i.id === itemId);
        if (item) Object.assign(item, updates);
      }
    };
    searchIn(d.gov_compliance_extension.federal);
    searchIn(d.gov_compliance_extension.state);
  });
}}
```

- [ ] **Step 2: Wire up routes in App.tsx**

Ensure Gov Compliance routes import the real pages (not placeholders).

- [ ] **Step 3: Verify Gov Compliance flow**

```bash
python3 build.py --dev
```
Test: Toggle Gov Compliance on in sidebar → toggle Federal on → navigate to FITARA Compliance → score items → verify scores appear in sidebar and dashboard composite.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/GovComplianceSection.tsx frontend/src/App.tsx
git commit -m "feat: add Gov Compliance section page with item scoring"
```

### Task 6.3: Update useNextUnscored for Gov Compliance

**Files:**
- Create: `frontend/src/hooks/useNextUnscored.ts` (adapted from Zero-Trust)

- [ ] **Step 1: Copy and adapt useNextUnscored.ts**

Copy from Zero-Trust. Remove cross-cutting and classified traversal. Add Gov Compliance traversal:

```typescript
// After pillar traversal...
if (data.gov_compliance_enabled && data.gov_compliance_extension) {
  const ext = data.gov_compliance_extension;
  const traverseSubModule = (subModule: ComplianceSubModule) => {
    if (!subModule.enabled) return;
    for (const section of subModule.sections) {
      for (const ca of section.capability_areas) {
        for (const item of ca.items) {
          if (item.score === null && !item.na) {
            // Return path: /gov-compliance/{sectionId}/{areaId}?focus={itemId}
          }
        }
      }
    }
  };
  traverseSubModule(ext.federal);
  traverseSubModule(ext.state);
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/hooks/useNextUnscored.ts
git commit -m "feat: add useNextUnscored hook with Gov Compliance support"
```

---

## Chunk 7: Exports

### Task 7.1: Export engine

**Files:**
- Create: `backend/export_engine.py` (adapted from Zero-Trust)

- [ ] **Step 1: Copy and adapt export_engine.py from Zero-Trust**

Copy `/Users/john/Dev/Assessments/Zero-Trust/backend/export_engine.py`. Adapt:

**Core changes:**
- 7 pillars instead of 5 (affects radar chart, workbook sheets, findings sections, outbrief slides)
- Remove cross-cutting and classified sections from all exports
- Zero-Trust has a `backend/excel_cell_map.py` for template-based workbook exports. If copying the workbook export logic, either also copy and adapt this file, or rewrite the workbook export to be self-contained without it
- Add Gov Compliance data to exports when enabled
- Update maturity band labels: Traditional→Reactive, etc.
- Update score level labels: Traditional/Initial/Advanced/Optimal → Initial/Developing/Established/Optimizing
- Update radar chart to show 7 or 8 axes

**Add 3 new export methods:**

```python
def export_heatmap(self, data: dict) -> list[str]:
    """D-06: Maturity Heatmap (XLSX) — Pillar × CA color-coded score grid"""
    wb = Workbook()
    ws = wb.active
    ws.title = "Maturity Heatmap"
    # Header row: Pillar names
    # Each row: CA name + score per pillar (color-coded cells)
    # Use openpyxl PatternFill with score colors

def export_quick_wins(self, data: dict) -> list[str]:
    """D-07: Quick Wins Report (DOCX) — Low-score items prioritized"""
    # Find all items scored 1 or 2
    # Sort by: score ascending, then by pillar weight descending (higher weight = higher impact)
    # Group into "Immediate" (score=1) and "Short-term" (score=2)
    # Include item text, current score, pillar, capability area, notes

def export_compliance_mapping(self, data: dict) -> list[str]:
    """D-08: Compliance Mapping (DOCX) — Maps to TOGAF 10 + gov mandates"""
    # Map pillar scores to TOGAF 10 ADM phases
    # If Gov Compliance enabled, include FITARA/NASCIO mapping
    # Table format: Requirement | Related Items | Average Score | Gap | Recommendation
```

**Update export type dispatch:**
```python
EXPORT_MAP = {
    "findings": self.export_findings,
    "executive-summary": self.export_executive_summary,
    "gap-analysis": self.export_gap_analysis,
    "workbook": self.export_workbook,
    "outbrief": self.export_outbrief,
    "heatmap": self.export_heatmap,
    "quick-wins": self.export_quick_wins,
    "compliance-mapping": self.export_compliance_mapping,
}
```

- [ ] **Step 2: Update main.py export route**

Ensure the `POST /api/export/{type}` route handles all 8 types + "all".

- [ ] **Step 3: Create exports directory**

```bash
mkdir -p /Users/john/Dev/Assessments/IT-Strategy/exports
```

- [ ] **Step 4: Test each export type**

Score several items across at least 2-3 pillars, then test:
```bash
source .venv/bin/activate
python3 -m backend.main &
sleep 2
for type in findings executive-summary gap-analysis workbook outbrief heatmap quick-wins compliance-mapping; do
  echo "Testing export: $type"
  curl -s -X POST http://localhost:8761/api/export/$type | python3 -c "import sys,json; print(json.load(sys.stdin))"
done
kill %1
```
Expected: Each returns `{"filenames": ["exports/D-XX_..."]}` with actual files created.

- [ ] **Step 5: Commit**

```bash
git add backend/export_engine.py backend/main.py
git commit -m "feat: add export engine with 8 export types including heatmap, quick-wins, compliance-mapping"
```

### Task 7.2: Export page

**Files:**
- Create: `frontend/src/pages/Export.tsx` (adapted from Zero-Trust)

- [ ] **Step 1: Copy and adapt ExportPage.tsx**

Copy from Zero-Trust. Update deliverables list to 8 exports:
```tsx
const DELIVERABLES = [
  { id: 'findings', code: 'D-01', name: 'Assessment Findings', format: 'DOCX', icon: FileText },
  { id: 'executive-summary', code: 'D-02', name: 'Executive Summary', format: 'DOCX', icon: FileText },
  { id: 'gap-analysis', code: 'D-03', name: 'Gap Analysis & Roadmap', format: 'DOCX', icon: FileText },
  { id: 'workbook', code: 'D-04', name: 'Scored Assessment Workbook', format: 'XLSX', icon: Table },
  { id: 'outbrief', code: 'D-05', name: 'Out-Brief Presentation', format: 'PPTX', icon: Presentation },
  { id: 'heatmap', code: 'D-06', name: 'Maturity Heatmap', format: 'XLSX', icon: Grid },
  { id: 'quick-wins', code: 'D-07', name: 'Quick Wins Report', format: 'DOCX', icon: Zap },
  { id: 'compliance-mapping', code: 'D-08', name: 'Compliance Mapping', format: 'DOCX', icon: ClipboardCheck },
];
```

Keep validation panel from Zero-Trust (adapted for IT-Strategy validation rules).

- [ ] **Step 2: Verify export page works**

Navigate to Export page, click each export button, verify files generate.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Export.tsx
git commit -m "feat: add export page with 8 deliverable types"
```

---

## Chunk 8: Polish & Packaging

### Task 8.1: Command palette

**Files:**
- Create: `frontend/src/components/CommandPalette.tsx` (adapted from Zero-Trust)

- [ ] **Step 1: Copy and adapt CommandPalette.tsx**

Copy from Zero-Trust. Remove cross-cutting and classified entries. Add Gov Compliance entries:

```tsx
// Add Gov Compliance entries when enabled
if (data.gov_compliance_enabled && data.gov_compliance_extension) {
  const ext = data.gov_compliance_extension;
  const addSections = (subModule: ComplianceSubModule, subLabel: string) => {
    if (!subModule.enabled) return;
    for (const section of subModule.sections) {
      entries.push({
        id: section.id,
        label: section.name,
        breadcrumb: `Gov Compliance → ${subLabel}`,
        path: `/gov-compliance/${section.id}`,
        icon: Shield,
      });
      for (const ca of section.capability_areas) {
        entries.push({
          id: ca.id,
          label: ca.name,
          breadcrumb: `Gov Compliance → ${section.name}`,
          path: `/gov-compliance/${section.id}/${ca.id}`,
        });
      }
    }
  };
  addSections(ext.federal, 'Federal');
  addSections(ext.state, 'State');
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/CommandPalette.tsx
git commit -m "feat: add command palette with Gov Compliance entries"
```

### Task 8.2: Validation and onboarding

**Files:**
- Create: `frontend/src/validation.ts` (adapted from Zero-Trust)
- Create: `frontend/src/components/OnboardingTooltip.tsx` (adapted from Zero-Trust)

- [ ] **Step 1: Copy and adapt validation.ts**

Copy from Zero-Trust. Remove cross-cutting and classified validation traversal. Add Gov Compliance traversal:

```typescript
// After pillar validation...
if (data.gov_compliance_enabled && data.gov_compliance_extension) {
  const ext = data.gov_compliance_extension;
  const validateSubModule = (sub: ComplianceSubModule) => {
    if (!sub.enabled) return;
    for (const section of sub.sections) {
      for (const ca of section.capability_areas) {
        for (const item of ca.items) {
          issues.push(...checkItem(item, section.name, ca.name,
            `/gov-compliance/${section.id}/${ca.id}`));
        }
      }
    }
  };
  validateSubModule(ext.federal);
  validateSubModule(ext.state);
}
```

- [ ] **Step 2: Copy and adapt OnboardingTooltip.tsx**

Copy from Zero-Trust. Change localStorage key from `'zt-tooltips-dismissed'` to `'it-strategy-tooltips-dismissed'`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/validation.ts frontend/src/components/OnboardingTooltip.tsx
git commit -m "feat: add validation rules and onboarding tooltips"
```

### Task 8.3: Settings and Help pages

**Files:**
- Create: `frontend/src/pages/Settings.tsx` (adapted from Zero-Trust)
- Create: `frontend/src/pages/Help.tsx` (adapted from Zero-Trust)

- [ ] **Step 1: Copy and adapt Settings.tsx**

Copy from Zero-Trust. Adapt:
- 5 weighting models (balanced, strategy_heavy, operations_heavy, modernization, governance_first) instead of Zero-Trust's models
- 7 pillar weight display instead of 5
- Target score inputs for 7 pillars
- Gov Compliance toggle (may already be in sidebar, but Settings should show it too)
- Remove classified extension toggle

- [ ] **Step 2: Copy and adapt Help.tsx**

Copy from Zero-Trust. Update:
- Tool name: "IT Strategy Assessment Tool"
- Framework reference: "TOGAF 10" instead of "CISA ZTMM v2.0"
- Score labels: Initial/Developing/Established/Optimizing
- Export list: 8 deliverables
- Keyboard shortcuts: same

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Settings.tsx frontend/src/pages/Help.tsx
git commit -m "feat: add settings and help pages"
```

### Task 8.4: PyInstaller specs and distribution

**Files:**
- Create: `assessment-tool-macos.spec` (adapted from Zero-Trust)
- Create: `assessment-tool-windows.spec` (adapted from Zero-Trust)

- [ ] **Step 1: Copy and adapt macOS spec**

Copy from Zero-Trust. Key changes:
- `name='assessment-tool'` (same)
- `target_arch='arm64'` (same — GitHub macOS runners are ARM-only)
- Conditional templates directory (as specified in implementation prompt Section 12):
```python
import os
datas = [
    ('backend/static', 'static'),
    ('framework', 'framework'),
]
if os.path.isdir('templates'):
    datas.append(('templates', 'templates'))
```

- [ ] **Step 2: Copy and adapt Windows spec**

Same as macOS but without `target_arch`.

- [ ] **Step 3: Update build.py for distribution**

Verify `build.py --dist` creates `dist/ITStrategyAssessment/` with correct contents and ZIP.

- [ ] **Step 4: Commit**

```bash
git add assessment-tool-macos.spec assessment-tool-windows.spec build.py
git commit -m "feat: add PyInstaller specs and distribution packaging"
```

### Task 8.5: README and GitHub Actions

**Files:**
- Create: `README.txt` (adapted from Zero-Trust)
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/release.yml` (adapted from Zero-Trust)

- [ ] **Step 1: Create README.txt**

Copy from Zero-Trust. Update:
- Tool name throughout
- Export deliverables list (8 exports)
- Port range: 8761-8770
- Framework reference: TOGAF 10

- [ ] **Step 2: Create CI workflow**

```yaml
name: CI
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: cd frontend && npm ci && npx tsc --noEmit
```

- [ ] **Step 3: Create release workflow**

Copy from Zero-Trust. Adapt:
- Distribution ZIP names: `ITStrategyAssessment-macOS-{tag}`, `ITStrategyAssessment-Windows-{tag}`
- Release title: "IT Strategy Assessment Tool {version}"
- All other structure identical (see implementation prompt Section 12 for exact YAML)

- [ ] **Step 4: Commit**

```bash
git add README.txt .github/
git commit -m "feat: add README, CI, and release workflows"
```

### Task 8.6: Final integration verification

- [ ] **Step 1: Build frontend and verify full app**

```bash
cd /Users/john/Dev/Assessments/IT-Strategy
python3 build.py --frontend
source .venv/bin/activate
python3 -m backend.main
```

Test checklist:
- [ ] Client Info: enter data, navigate to Dashboard
- [ ] Dashboard: composite score, radar chart (7 axes), bar chart, maturity band
- [ ] Sidebar: 7 pillars with progress rings and score badges
- [ ] Pillar Summary: shows CAs with scores
- [ ] Capability Area: score items (1-4), N/A, confidence, notes, evidence
- [ ] Keyboard shortcuts: 1-4, H/M/L, N, arrows, Cmd+K, Cmd+Right
- [ ] Gov Compliance: enable main toggle, enable Federal, score items
- [ ] Gov Compliance: verify scores appear in composite on Dashboard
- [ ] Gov Compliance: radar chart shows 8th axis
- [ ] Settings: change weighting model, adjust targets
- [ ] Exports: generate all 8 types, verify files in exports/
- [ ] Command Palette: Cmd+K, search for pillar/CA names
- [ ] Auto-save: modify data, see "Saving..." → "Saved" in footer
- [ ] Sidebar: resize (drag edge), collapse (icon-only), persist across reload

- [ ] **Step 2: Clean up any placeholder code**

Remove any remaining placeholder pages or TODO comments.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: final polish and integration verification"
```

---

## Dependency Graph

```
Chunk 1 (Scaffolding)
  └── Chunk 2 (Data Model & Framework)
       └── Chunk 3 (State Management & Layout)
            └── Chunk 4 (Scoring UI)
            │    └── Chunk 5 (Dashboard & Charts)
            │    └── Chunk 6 (Gov Compliance Extension)
            │         └── Chunk 7 (Exports)
            └── Chunk 8 (Polish & Packaging) — depends on all above
```

Chunks 5 and 6 can be worked in parallel after Chunk 4. Chunk 7 depends on Chunk 6 (Gov Compliance data in exports). Chunk 8 is the final integration pass.
