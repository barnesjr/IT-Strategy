# IT Strategy Assessment Tool — Implementation Prompt

> **Purpose:** Implementation prompt for building the IT Strategy Assessment Tool.
> Use this as the implementation prompt for Claude Code.

---

## 1. Branding & Design

All assessment tools follow the shared Peraton design system.

- **Design guide:** `/Users/john/Dev/Assessments/Design-guide.md`
- **Logo:** `/Users/john/Dev/Assessments/2025_Peraton_Logo_2000x541px_White_White.png`
- **Theme:** Dark mode — page background `#0A0A0B`, surfaces `#131212`/`#1C1C1E`/`#262626`/`#333333`
- **Primary accent:** `#1BA1E2` (Peraton Cyan)
- **Text:** White `#FFFFFF` primary, Light Gray `#D0D0D0` secondary
- **Font stack:** `"Segoe UI", -apple-system, system-ui, Roboto, "Helvetica Neue", sans-serif`
- **Logo placement:** Sidebar top-left, ~160px wide on dark surface; loading screen centered ~300px wide

---

## 2. Tech Stack (Fixed)

All assessment tools use this exact stack. Do not substitute.

### Backend
| Package | Purpose |
|---------|---------|
| Python 3 | Runtime |
| FastAPI | API framework |
| Uvicorn | ASGI server |
| Pydantic v2 | Data models & validation |
| openpyxl | Excel (.xlsx) export |
| docxtpl | Word (.docx) export (template-based, wraps python-docx) |
| python-pptx | PowerPoint (.pptx) export |
| matplotlib (Agg backend) | Radar chart PNG generation |
| PyInstaller | Standalone executable packaging |

### Frontend
| Package | Purpose |
|---------|---------|
| React 19 | UI framework |
| TypeScript 5.9+ | Type safety |
| Vite 7 | Build tool + dev server |
| Tailwind CSS 4 | Utility-first styling |
| Recharts | Interactive charts (RadarChart, BarChart) |
| Lucide React | Icon library |
| React Router 7 | Client-side routing |

### Python virtual environment
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

## 3. Domain Configuration

### Identity
```
"IT Strategy Assessment Tool"          # Tool display name
"it-strategy"                          # Tool slug (filenames, dist folder)
"TOGAF 10"                             # Framework alignment
"it-strategy-sidebar"                  # localStorage sidebar key
8761                                   # Default port (auto-scans 8761-8770)
```

### Hierarchy Model

This tool uses **flat (2-level nesting):**
```
Pillar (scored + weighted)
  └── Capability Area
       └── Assessment Item
```

```
"flat"                                 # Hierarchy style
[                                      # Top-level entities (7 pillars)
  {"id":"governance","name":"Governance & Oversight","weight":0.15},
  {"id":"strategy","name":"Strategy & Planning","weight":0.15},
  {"id":"enterprise-architecture","name":"Enterprise Architecture","weight":0.15},
  {"id":"service-management","name":"Service Management","weight":0.14},
  {"id":"infrastructure-cloud","name":"Infrastructure & Cloud","weight":0.14},
  {"id":"workforce-culture","name":"Workforce & Culture","weight":0.13},
  {"id":"innovation-digital","name":"Innovation & Digital","weight":0.14}
]
# No mid-level entities (flat hierarchy)
```

### Scoring
```
"1-4"                                                                    # Score scale
{1:"Initial", 2:"Developing", 3:"Established", 4:"Optimizing"}          # Score labels
{1:"#ef4444", 2:"#f97316", 3:"#84cc16", 4:"#22c55e"}                    # Score colors
["initial","developing","established","optimizing"]                       # Rubric keys
```

### Maturity Bands
```
[
  {min:1.0, max:1.5, label:"Reactive",    color:"#ef4444"},
  {min:1.5, max:2.0, label:"Emerging",    color:"#f97316"},
  {min:2.0, max:2.5, label:"Developing",  color:"#eab308"},
  {min:2.5, max:3.0, label:"Established", color:"#84cc16"},
  {min:3.0, max:3.5, label:"Managed",     color:"#22c55e"},
  {min:3.5, max:4.0, label:"Optimizing",  color:"#15803d"}
]
```

### Weighting Models
```
{
  "balanced":         {label:"Balanced",           weights:{"governance":0.143,"strategy":0.143,"enterprise-architecture":0.143,"service-management":0.143,"infrastructure-cloud":0.143,"workforce-culture":0.143,"innovation-digital":0.143}},
  "strategy_heavy":   {label:"Strategy-Heavy",     weights:{"governance":0.18,"strategy":0.20,"enterprise-architecture":0.18,"service-management":0.12,"infrastructure-cloud":0.12,"workforce-culture":0.10,"innovation-digital":0.10}},
  "operations_heavy": {label:"Operations-Heavy",   weights:{"governance":0.12,"strategy":0.10,"enterprise-architecture":0.12,"service-management":0.20,"infrastructure-cloud":0.20,"workforce-culture":0.14,"innovation-digital":0.12}},
  "modernization":    {label:"Modernization",      weights:{"governance":0.10,"strategy":0.12,"enterprise-architecture":0.14,"service-management":0.12,"infrastructure-cloud":0.20,"workforce-culture":0.12,"innovation-digital":0.20}},
  "governance_first": {label:"Governance-First",   weights:{"governance":0.22,"strategy":0.14,"enterprise-architecture":0.20,"service-management":0.12,"infrastructure-cloud":0.10,"workforce-culture":0.12,"innovation-digital":0.10}}
}
"balanced"                             # Default weighting model
3.0                                    # Default per-pillar target score
```

### Exports & Distribution
```
["findings","executive-summary","gap-analysis","workbook","outbrief","heatmap","quick-wins","compliance-mapping"]
"ITStrategyAssessment"                 # Distribution folder name
```

### Extension Module: Government Compliance
```
true                                   # Extension enabled
"Government Compliance Module"         # Extension name
"Gov Compliance"                       # Short sidebar label
"sidebar switch"                       # Toggle mechanism

# Extension entities — organized into two sub-modules with independent sub-toggles:
# Federal sub-module (FITARA/GAO ITIM):
[
  {"id":"fitara-compliance","name":"FITARA Compliance"},
  {"id":"it-investment-management","name":"IT Investment Management"},
  {"id":"acquisition-procurement","name":"Acquisition & Procurement"},
  {"id":"cybersecurity-governance","name":"Cybersecurity Governance"}
]
# State sub-module (NASCIO):
[
  {"id":"ea-maturity","name":"EA Maturity"},
  {"id":"portfolio-management","name":"Portfolio Management"},
  {"id":"digital-services","name":"Digital Services"}
]

# IMPLEMENTATION NOTE: The extension module has a main toggle (Gov Compliance on/off)
# and two independent sub-toggles within it:
#   - Federal (FITARA/GAO ITIM) — on/off
#   - State (NASCIO) — on/off
# The main toggle turns all sub-modules on. Each sub-module can then be individually
# toggled off. The data model should include:
#   {
#     "enabled": true,
#     "federal": { "enabled": true, "sections": [...] },
#     "state": { "enabled": false, "sections": [...] }
#   }
```

---

## 4. Project Structure

```
it-strategy/
├── backend/
│   ├── __init__.py
│   ├── main.py                        # FastAPI app — serves API + built frontend
│   ├── models.py                      # Pydantic data models
│   ├── data_manager.py                # Load/save assessment + framework JSON
│   ├── export_engine.py               # All export generators
│   └── static/                        # Vite build output (generated)
├── frontend/
│   ├── package.json
│   ├── vite.config.ts                 # Proxy /api → backend in dev
│   ├── tailwind.config.ts             # Design tokens from Design-guide.md
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── index.html
│   └── src/
│       ├── main.tsx                   # React entry point
│       ├── App.tsx                    # Router + layout (sidebar + content)
│       ├── store.tsx                  # React Context state management
│       ├── types.ts                   # TypeScript interfaces + constants
│       ├── api.ts                     # Fetch client for /api/*
│       ├── scoring.ts                 # Score calculations
│       ├── validation.ts              # Assessment validation rules
│       ├── hooks/
│       │   └── useNextUnscored.ts     # Cmd+Right jump-to-next-unscored logic
│       ├── components/
│       │   ├── Sidebar.tsx            # Collapsible nav tree with progress rings
│       │   ├── AssessmentItemCard.tsx  # Item card with scoring + notes
│       │   ├── ScoringWidget.tsx      # 1-4 radio buttons + N/A toggle
│       │   ├── ConfidenceWidget.tsx   # High/Medium/Low selector
│       │   ├── Breadcrumb.tsx         # Path breadcrumbs
│       │   ├── StatsFooter.tsx        # Progress bar + save status
│       │   ├── CommandPalette.tsx     # Cmd+K quick navigation
│       │   └── OnboardingTooltip.tsx  # First-time hints
│       └── pages/
│           ├── ClientInfo.tsx         # Client name, industry, date, assessor
│           ├── Dashboard.tsx          # Composite score, radar chart, progress
│           ├── PillarSummary.tsx      # Pillar summary view
│           ├── CapabilityArea.tsx     # Item-level scoring (main work page)
│           ├── GovComplianceSummary.tsx  # Government Compliance extension overview
│           ├── GovComplianceSection.tsx  # Government Compliance section items
│           ├── Export.tsx             # Export deliverables UI
│           ├── Settings.tsx           # Weighting model, target scores
│           └── Help.tsx              # Keyboard shortcuts, documentation
├── framework/
│   └── assessment-framework.json      # Read-only framework definition
├── templates/                         # (Optional) Word/Excel/PowerPoint templates
├── exports/                           # Generated deliverables (created at runtime)
├── build.py                           # Build orchestration script
├── assessment-tool-macos.spec         # PyInstaller spec — macOS
├── assessment-tool-windows.spec       # PyInstaller spec — Windows
├── requirements.txt                   # Python dependencies
├── data.json                          # Persistent assessment data (auto-created)
├── data.json.bak                      # Backup (auto-created on save)
├── README.txt                         # End-user documentation
└── .gitignore
```

---

## 5. Data Model

### Backend — Pydantic Models (`backend/models.py`)

```python
from pydantic import BaseModel, Field
from typing import Optional

class EvidenceReference(BaseModel):
    document: str = ""
    section: str = ""
    date: str = ""

class AssessmentItem(BaseModel):
    id: str
    text: str
    score: Optional[int] = Field(None, ge=1, le=4)
    na: bool = False
    na_justification: Optional[str] = None
    confidence: Optional[str] = None  # "High" | "Medium" | "Low"
    notes: str = ""
    evidence_references: list[EvidenceReference] = Field(default_factory=list)
    attachments: list[str] = Field(default_factory=list)  # Optional: file attachment paths

class CapabilityArea(BaseModel):
    id: str
    name: str
    items: list[AssessmentItem] = Field(default_factory=list)

# --- Flat Hierarchy ---
class Pillar(BaseModel):
    id: str
    name: str
    weight: float
    capability_areas: list[CapabilityArea] = Field(default_factory=list)

# --- Government Compliance Extension ---
class ComplianceSection(BaseModel):
    id: str
    name: str
    capability_areas: list[CapabilityArea] = Field(default_factory=list)

# Sub-module with independent toggle (Federal or State)
class ComplianceSubModule(BaseModel):
    enabled: bool = False
    sections: list[ComplianceSection] = Field(default_factory=list)

class GovComplianceExtension(BaseModel):
    enabled: bool = False
    federal: ComplianceSubModule = Field(default_factory=ComplianceSubModule)
    state: ComplianceSubModule = Field(default_factory=ComplianceSubModule)

# --- Shared Models ---
class ClientInfo(BaseModel):
    name: str = ""
    industry: str = ""
    assessment_date: str = ""
    assessor: str = ""

class AssessmentMetadata(BaseModel):
    framework_version: str = "1.0"
    tool_version: str = "1.0.0"
    last_modified: str = ""

class ScoringConfig(BaseModel):
    weighting_model: str = "balanced"
    pillar_weights: dict[str, float] = Field(default_factory=dict)
    custom_weights: Optional[dict[str, float]] = None

class AssessmentData(BaseModel):
    client_info: ClientInfo = Field(default_factory=ClientInfo)
    assessment_metadata: AssessmentMetadata = Field(default_factory=AssessmentMetadata)
    scoring_config: ScoringConfig = Field(default_factory=ScoringConfig)
    pillars: list[Pillar] = Field(default_factory=list)
    gov_compliance_enabled: bool = False
    gov_compliance_extension: Optional[GovComplianceExtension] = None
    target_scores: dict[str, float] = Field(default_factory=dict)
```

### Frontend — TypeScript Interfaces (`frontend/src/types.ts`)

```typescript
// Score constants
export const SCORE_LABELS: Record<number, string> = {1:"Initial", 2:"Developing", 3:"Established", 4:"Optimizing"};
export const SCORE_COLORS: Record<number, string> = {1:"#ef4444", 2:"#f97316", 3:"#84cc16", 4:"#22c55e"};
export const MATURITY_BANDS = [
  {min:1.0, max:1.5, label:"Reactive",    color:"#ef4444"},
  {min:1.5, max:2.0, label:"Emerging",    color:"#f97316"},
  {min:2.0, max:2.5, label:"Developing",  color:"#eab308"},
  {min:2.5, max:3.0, label:"Established", color:"#84cc16"},
  {min:3.0, max:3.5, label:"Managed",     color:"#22c55e"},
  {min:3.5, max:4.0, label:"Optimizing",  color:"#15803d"}
];
export const WEIGHTING_MODELS: Record<string, { label: string; weights: Record<string, number> }> = {
  "balanced":         {label:"Balanced",           weights:{"governance":0.143,"strategy":0.143,"enterprise-architecture":0.143,"service-management":0.143,"infrastructure-cloud":0.143,"workforce-culture":0.143,"innovation-digital":0.143}},
  "strategy_heavy":   {label:"Strategy-Heavy",     weights:{"governance":0.18,"strategy":0.20,"enterprise-architecture":0.18,"service-management":0.12,"infrastructure-cloud":0.12,"workforce-culture":0.10,"innovation-digital":0.10}},
  "operations_heavy": {label:"Operations-Heavy",   weights:{"governance":0.12,"strategy":0.10,"enterprise-architecture":0.12,"service-management":0.20,"infrastructure-cloud":0.20,"workforce-culture":0.14,"innovation-digital":0.12}},
  "modernization":    {label:"Modernization",      weights:{"governance":0.10,"strategy":0.12,"enterprise-architecture":0.14,"service-management":0.12,"infrastructure-cloud":0.20,"workforce-culture":0.12,"innovation-digital":0.20}},
  "governance_first": {label:"Governance-First",   weights:{"governance":0.22,"strategy":0.14,"enterprise-architecture":0.20,"service-management":0.12,"infrastructure-cloud":0.10,"workforce-culture":0.12,"innovation-digital":0.10}}
};

// Utility function — maps a numeric score to its maturity band
export function getMaturityBand(score: number): { label: string; color: string } { ... }

// Assessment interfaces — mirror backend models
export interface EvidenceReference { document: string; section: string; date: string; }
export interface AssessmentItem { id: string; text: string; score: number | null; na: boolean; na_justification: string | null; confidence: string | null; notes: string; evidence_references: EvidenceReference[]; attachments: string[]; }
export interface CapabilityArea { id: string; name: string; items: AssessmentItem[]; }

// Flat hierarchy
export interface Pillar { id: string; name: string; weight: number; capability_areas: CapabilityArea[]; }

// Government Compliance Extension
export interface ComplianceSection { id: string; name: string; capability_areas: CapabilityArea[]; }
export interface ComplianceSubModule { enabled: boolean; sections: ComplianceSection[]; }
export interface GovComplianceExtension { enabled: boolean; federal: ComplianceSubModule; state: ComplianceSubModule; }

// Framework read-only interfaces
export interface FrameworkItem { id: string; text: string; rubric: Record<string, string>; }
// rubric keys = ["initial","developing","established","optimizing"]
export interface FrameworkCapabilityArea { id: string; name: string; items: FrameworkItem[]; }
// ... rest mirrors framework JSON structure ...

export interface ClientInfo { name: string; industry: string; assessment_date: string; assessor: string; }
export interface AssessmentMetadata { framework_version: string; tool_version: string; last_modified: string; }
```

---

## 6. API Routes

All tools expose exactly these endpoints:

| Method | Endpoint | Request Body | Response |
|--------|----------|-------------|----------|
| `GET` | `/api/assessment` | — | Full `AssessmentData` JSON |
| `PUT` | `/api/assessment` | `AssessmentData` JSON | `{"status": "saved"}` |
| `GET` | `/api/framework` | — | Framework JSON (read-only) |
| `POST` | `/api/export/{type}` | — | `{"filenames": ["path1", ...]}` |

### Implementation Details (`backend/main.py`)

- **Port discovery:** Try `8761` through `8770`, use first available; log port diagnostics (`lsof`/`netstat`) if all ports busy
- **Auto-launch browser:** Call `webbrowser.open(url)` after server starts
- **Static files:** Serve built frontend from `backend/static/`
- **SPA fallback:** All non-`/api/*` GET requests serve `index.html`
- **No CORS needed:** Vite dev server proxies `/api` requests, so no CORS middleware required
- **Atomic save:** Write to temp file, then `os.replace()` to swap into `data.json`; write `data.json.bak` before overwriting
- **Load behavior:** Try `data.json` → fall back to `data.json.bak` → create fresh from framework
- **Export types:** `["findings","executive-summary","gap-analysis","workbook","outbrief","heatmap","quick-wins","compliance-mapping"]` + `"all"`
- **Error codes:** 400 invalid export type, 404 framework missing, 500 server error

---

## 7. Pages & Routing

```typescript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<ClientInfoPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />

    {/* --- Flat Hierarchy: Pillars --- */}
    <Route path="/pillars/:entityId" element={<PillarSummary />} />
    <Route path="/pillars/:entityId/:areaId" element={<CapabilityAreaPage />} />

    {/* --- Government Compliance Extension --- */}
    <Route path="/gov-compliance" element={<GovComplianceSummary />} />
    <Route path="/gov-compliance/:sectionId" element={<GovComplianceSection />} />
    <Route path="/gov-compliance/:sectionId/:areaId" element={<GovComplianceSection />} />

    {/* --- Standard pages --- */}
    <Route path="/export" element={<ExportPage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/help" element={<HelpPage />} />
  </Routes>
</BrowserRouter>
```

### Global Keyboard Shortcuts
- `Cmd/Ctrl+K` — Toggle Command Palette
- `Cmd/Ctrl+Right` — Jump to next unscored item

### CapabilityArea Page Keyboard Shortcuts
- `1`-`4` — Set score on focused item
- `H`/`M`/`L` — Set confidence (High/Medium/Low)
- `N` — Toggle N/A
- `Arrow Up/Down` — Navigate between items

---

## 8. Sidebar Structure

### Layout
```
[Logo ~160px wide]
──────────────────
Client Info          (link → /)
Dashboard            (link → /dashboard)
──────────────────

Pillar 1: GOVERNANCE & OVERSIGHT        [score badge] [progress ring] [chevron]
  ├── Capability Area 1                 [score] [ring]
  ├── Capability Area 2                 [score] [ring]
  └── ...

Pillar 2: STRATEGY & PLANNING
  └── ...

Pillar 3: ENTERPRISE ARCHITECTURE
  └── ...

Pillar 4: SERVICE MANAGEMENT
  └── ...

Pillar 5: INFRASTRUCTURE & CLOUD
  └── ...

Pillar 6: WORKFORCE & CULTURE
  └── ...

Pillar 7: INNOVATION & DIGITAL
  └── ...

──────────────────
Gov Compliance  [main toggle switch]
  ├── Federal (FITARA)  [sub-toggle]
  │     ├── FITARA Compliance
  │     ├── IT Investment Management
  │     ├── Acquisition & Procurement
  │     └── Cybersecurity Governance
  └── State (NASCIO)    [sub-toggle]
        ├── EA Maturity
        ├── Portfolio Management
        └── Digital Services
──────────────────

Export               (link → /export)
Settings             (link → /settings)
Help                 (link → /help)
```

### Behavior
- **Collapsible:** Toggle between 56px icon-only and full width
- **Resizable:** Drag right edge (min: `180px`, max: `480px`, default: `350px`)
- **Persist state:** `localStorage` key `"it-strategy-sidebar"`
- **Progress rings:** SVG circle showing % scored per entity
- **Score badges:** Rounded average score, color-coded by `{1:"#ef4444", 2:"#f97316", 3:"#84cc16", 4:"#22c55e"}`
- **Chevron expand:** Click to show/hide children in tree

---

## 9. Export Deliverables

### Core Exports (all tools)

| # | Name | Format | Content |
|---|------|--------|---------|
| 1 | Assessment Findings | DOCX | Per-pillar item breakdown with scores, notes, evidence |
| 2 | Executive Summary | DOCX | Composite score, radar chart (embedded PNG), top gaps |
| 3 | Gap Analysis & Roadmap | DOCX | Gap matrix table (current vs target), remediation timeline |
| 4 | Scored Assessment Workbook | XLSX | Multi-sheet: Dashboard + per-pillar sheets with all items |
| 5 | Out-Brief Presentation | PPTX | Title + overview + radar chart + per-pillar slides |

### Domain-Specific Exports

| # | Name | Format | Content |
|---|------|--------|---------|
| 6 | Maturity Heatmap | XLSX | Pillar × Capability Area color-coded score grid |
| 7 | Quick Wins Report | DOCX | Low-score, high-impact items prioritized for quick remediation |
| 8 | Compliance Mapping | DOCX | Maps assessment scores to TOGAF 10 requirements and government mandates |

### Export Implementation Details
- **Filenames:** `D-XX_Name_YYYY-MM-DD_HHMMSS.ext` (timestamped)
- **Radar chart:** matplotlib Agg backend → `exports/radar_chart.png` (6×6 in, 150 DPI)
- **Template support:** If `templates/<name>-template.<ext>` exists, use it; otherwise auto-generate
- **"Export All" button:** Generates core exports + domain-specific (skip extension-only exports if extension disabled)

---

## 10. Key Behaviors

### Auto-Save
- **Debounce:** 300ms after any data change
- **Mechanism:** `PUT /api/assessment` with full `AssessmentData`
- **Backup:** Server writes `data.json.bak` before overwriting `data.json`
- **Status indicator:** StatsFooter shows "Saving..." / "Saved" / "Error"

### Scoring Engine (`frontend/src/scoring.ts`)
```typescript
averageScore(items: AssessmentItem[]): number      // Mean of scored items (exclude N/A)
capabilityAreaScore(ca: CapabilityArea): number     // Average of CA items
entityScore(entity: Pillar): number                 // Average of all items in pillar
weightedCompositeScore(data: AssessmentData): number // Σ(pillarScore × weight) / Σ(weights)
overallCompletion(data: AssessmentData): {scored: number, total: number}
```

### Command Palette (`Cmd+K`)
- Fuzzy search across all pillars + capability areas
- Navigate to any page instantly
- Show score + completion status in results

### Validation (`frontend/src/validation.ts`)
| Rule | Severity | Condition |
|------|----------|-----------|
| `unscored` | info | Item has no score and is not N/A |
| `na-no-justification` | error | N/A checked but no justification |
| `scored-no-notes` | warning | Score assigned but notes empty |
| `low-confidence-no-notes` | warning | Confidence = "Low" with no notes |

### Charts (Dashboard)
- **Radar chart:** Recharts `RadarChart` — one axis per pillar, scale 0–4
- **Bar chart:** Recharts `BarChart` — pillar scores with maturity band colors
- **Progress:** Overall completion percentage + per-pillar progress rings

### State Management (`frontend/src/store.tsx`)
- React Context with `useReducer` pattern
- `StoreProvider` wraps entire app
- `useStore()` hook returns `{data, framework, loading, saveStatus, updateData}`
- `updateData()` uses `structuredClone` for immutable updates

---

## 11. Framework Content

The framework JSON defines all assessment items and rubrics. Place at `framework/assessment-framework.json`.

### Structure

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
              "text": "Assessment item question text",
              "rubric": {
                "initial": "Level 1 description...",
                "developing": "Level 2 description...",
                "established": "Level 3 description...",
                "optimizing": "Level 4 description..."
              }
            }
          ]
        }
      ]
    }
  ],

  "gov_compliance_extension": {
    "federal": {
      "sections": [
        {
          "id": "fitara-compliance",
          "name": "FITARA Compliance",
          "capability_areas": [...]
        }
      ]
    },
    "state": {
      "sections": [
        {
          "id": "ea-maturity",
          "name": "EA Maturity",
          "capability_areas": [...]
        }
      ]
    }
  },

  "weighting_models": {
    "balanced":         {"label":"Balanced",         "weights":{"governance":0.143,"strategy":0.143,"enterprise-architecture":0.143,"service-management":0.143,"infrastructure-cloud":0.143,"workforce-culture":0.143,"innovation-digital":0.143}},
    "strategy_heavy":   {"label":"Strategy-Heavy",   "weights":{"governance":0.18,"strategy":0.20,"enterprise-architecture":0.18,"service-management":0.12,"infrastructure-cloud":0.12,"workforce-culture":0.10,"innovation-digital":0.10}},
    "operations_heavy": {"label":"Operations-Heavy", "weights":{"governance":0.12,"strategy":0.10,"enterprise-architecture":0.12,"service-management":0.20,"infrastructure-cloud":0.20,"workforce-culture":0.14,"innovation-digital":0.12}},
    "modernization":    {"label":"Modernization",    "weights":{"governance":0.10,"strategy":0.12,"enterprise-architecture":0.14,"service-management":0.12,"infrastructure-cloud":0.20,"workforce-culture":0.12,"innovation-digital":0.20}},
    "governance_first": {"label":"Governance-First", "weights":{"governance":0.22,"strategy":0.14,"enterprise-architecture":0.20,"service-management":0.12,"infrastructure-cloud":0.10,"workforce-culture":0.12,"innovation-digital":0.10}}
  }
}
```

### Content Specification

Generate ~350 assessment items across the 7 pillars, aligned to TOGAF 10 practices. Additionally, generate ~50-75 extension items for the Government Compliance module (split across Federal and State sub-modules).

**Pillar breakdown (~50 items each):**

1. **Governance & Oversight** — IT governance structure, decision-making authority, policy management, executive alignment, performance oversight, risk governance, compliance management
2. **Strategy & Planning** — Strategic planning processes, business-IT alignment, roadmap development, portfolio prioritization, value realization, stakeholder engagement, strategic communication
3. **Enterprise Architecture** — TOGAF ADM adoption, architecture governance, standards management, technology radar, reference architectures, architecture repository, capability modeling
4. **Service Management** — IT service catalog, SLA management, incident/problem processes, service desk maturity, customer satisfaction, service improvement, vendor management
5. **Infrastructure & Cloud** — Cloud strategy, infrastructure modernization, platform engineering, technical debt management, capacity planning, disaster recovery, DevOps practices
6. **Workforce & Culture** — IT skills assessment, training programs, talent retention, organizational design, change management, collaboration, diversity & inclusion
7. **Innovation & Digital** — Innovation pipeline, emerging technology evaluation, digital transformation roadmap, citizen/customer experience, data-driven decision-making, agile practices, continuous improvement

**Government Compliance Extension (~50-75 items):**

Federal sub-module (~35-45 items):
- **FITARA Compliance** — CIO authority, IT spending transparency, risk management, workforce planning
- **IT Investment Management** — Portfolio selection criteria, business case development, investment control, post-implementation review (aligned to GAO ITIM 5-stage model)
- **Acquisition & Procurement** — IT acquisition strategy, modular contracting, vendor diversity, contract management
- **Cybersecurity Governance** — FISMA compliance, FedRAMP alignment, security program maturity, incident response

State sub-module (~20-30 items):
- **EA Maturity** — Architecture practice establishment, standards adoption, governance integration (aligned to NASCIO EA Maturity Model)
- **Portfolio Management** — IT portfolio visibility, project prioritization, ROI tracking
- **Digital Services** — Citizen-facing service modernization, accessibility compliance, digital equity

Each item must include a 4-level rubric with descriptions for: initial, developing, established, optimizing.

---

## 12. Build & Packaging

### `build.py` Commands

```bash
python3 build.py              # Build standalone executable (PyInstaller)
python3 build.py --dev        # Run backend (FastAPI) + frontend (Vite) dev servers
python3 build.py --frontend   # Build frontend only → backend/static/
python3 build.py --dist       # Build + create distribution ZIP
```

### Development Mode (`--dev`)
- Backend: `python -m backend.main` on port `8761`
- Frontend: `npm run dev` on port `5173` with Vite proxy `/api → localhost:8761`

### Frontend Build (`--frontend`)
- Runs `npm run build` in `frontend/`
- Output copied to `backend/static/`

### PyInstaller Packaging
- Spec files: `assessment-tool-macos.spec`, `assessment-tool-windows.spec`
- Entry point: `backend/main.py`
- Bundled data: `backend/static/`, `framework/`, `templates/` (if present)
- Hidden imports: `uvicorn.logging`, `uvicorn.loops.auto`, `uvicorn.protocols.http.auto`, `uvicorn.protocols.websockets.auto`, `uvicorn.lifespan.on`
- Output: `dist/assessment-tool` (macOS) or `dist/assessment-tool.exe` (Windows)

### Distribution ZIP (`--dist`)
Creates `dist/ITStrategyAssessment/`:
```
ITStrategyAssessment/
├── assessment-tool           # Executable
├── README.txt                # End-user guide
├── framework/                # Read-only framework JSON
├── templates/                # Optional export templates
└── exports/                  # Empty (generated at runtime)
```
Zipped to `dist/ITStrategyAssessment.zip` (local builds) or `ITStrategyAssessment-macOS-v1.0.0.zip` / `ITStrategyAssessment-Windows-v1.0.0.zip` (GitHub Actions releases, version tag appended).

### GitHub Actions (`.github/workflows/`)

#### CI (`.github/workflows/ci.yml`)
Lint + type-check on push and pull requests.

#### Release (`.github/workflows/release.yml`)

Builds macOS (ARM) + Windows executables and creates a draft GitHub release with both ZIPs. **Release zip filenames include the version tag** (e.g., `ITStrategyAssessment-macOS-v1.0.0.zip`, `ITStrategyAssessment-Windows-v1.0.0.zip`).

**Critical notes:**
- **GitHub macOS runners are ARM-only** (`macos-latest` = Apple Silicon). The macOS PyInstaller spec must use `target_arch='arm64'`. There are no x86 macOS runners available.
- **The `templates/` directory is optional and may not exist in the repo.** PyInstaller spec files must conditionally include it or the build will fail with `ERROR: Unable to find '…/templates'`. Use this pattern in both spec files:

```python
import os

datas = [
    ('backend/static', 'static'),
    ('framework', 'framework'),
]
if os.path.isdir('templates'):
    datas.append(('templates', 'templates'))

a = Analysis(
    ['backend/main.py'],
    datas=datas,
    ...
)
```

**Workflow structure:**

```yaml
name: Build & Release

on:
  push:
    tags: ['v*']
  workflow_dispatch:
    inputs:
      tag:
        description: 'Release tag (e.g. v1.0.0)'
        required: true

permissions:
  contents: write

jobs:
  build:
    strategy:
      fail-fast: false
      matrix:
        include:
          - os: macos-latest        # ARM only
            platform: macos
            zip_base: ITStrategyAssessment-macOS
          - os: windows-latest
            platform: windows
            zip_base: ITStrategyAssessment-Windows

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install Python dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt pyinstaller

      - name: Install and build frontend
        working-directory: frontend
        run: npm ci && npm run build

      - name: Build executable (macOS)
        if: matrix.platform == 'macos'
        run: python -m PyInstaller --distpath dist --workpath build_temp assessment-tool-macos.spec

      - name: Build executable (Windows)
        if: matrix.platform == 'windows'
        run: python -m PyInstaller --distpath dist --workpath build_temp assessment-tool-windows.spec

      - name: Determine version tag
        id: version
        shell: bash
        run: |
          if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
            echo "tag=${{ github.event.inputs.tag }}" >> "$GITHUB_OUTPUT"
          else
            echo "tag=${GITHUB_REF#refs/tags/}" >> "$GITHUB_OUTPUT"
          fi

      - name: Assemble distribution (macOS)
        if: matrix.platform == 'macos'
        run: |
          ZIP_NAME="${{ matrix.zip_base }}-${{ steps.version.outputs.tag }}"
          mkdir -p dist/${ZIP_NAME}
          cp dist/assessment-tool dist/${ZIP_NAME}/
          chmod +x dist/${ZIP_NAME}/assessment-tool
          cp -r framework dist/${ZIP_NAME}/
          if [ -d templates ]; then cp -r templates dist/${ZIP_NAME}/; else mkdir dist/${ZIP_NAME}/templates; fi
          if [ -f README.txt ]; then cp README.txt dist/${ZIP_NAME}/; fi
          mkdir -p dist/${ZIP_NAME}/exports
          cd dist && zip -r ${ZIP_NAME}.zip ${ZIP_NAME}

      - name: Assemble distribution (Windows)
        if: matrix.platform == 'windows'
        shell: pwsh
        run: |
          $ZipName = "${{ matrix.zip_base }}-${{ steps.version.outputs.tag }}"
          New-Item -ItemType Directory -Force -Path "dist/$ZipName"
          Copy-Item "dist/assessment-tool.exe" "dist/$ZipName/"
          Copy-Item -Recurse "framework" "dist/$ZipName/framework"
          if (Test-Path "templates") { Copy-Item -Recurse "templates" "dist/$ZipName/templates" } else { New-Item -ItemType Directory -Force -Path "dist/$ZipName/templates" }
          if (Test-Path "README.txt") { Copy-Item "README.txt" "dist/$ZipName/" }
          New-Item -ItemType Directory -Force -Path "dist/$ZipName/exports"
          Compress-Archive -Path "dist/$ZipName" -DestinationPath "dist/$ZipName.zip"

      - uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.zip_base }}-${{ steps.version.outputs.tag }}
          path: dist/${{ matrix.zip_base }}-${{ steps.version.outputs.tag }}.zip

  release:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Determine tag
        id: tag
        run: |
          if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
            echo "version=${{ github.event.inputs.tag }}" >> "$GITHUB_OUTPUT"
          else
            echo "version=${GITHUB_REF#refs/tags/}" >> "$GITHUB_OUTPUT"
          fi
      - uses: actions/download-artifact@v4
        with:
          path: artifacts
      - uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ steps.tag.outputs.version }}
          name: IT Strategy Assessment Tool ${{ steps.tag.outputs.version }}
          draft: true
          generate_release_notes: true
          files: |
            artifacts/ITStrategyAssessment-macOS-${{ steps.tag.outputs.version }}/ITStrategyAssessment-macOS-${{ steps.tag.outputs.version }}.zip
            artifacts/ITStrategyAssessment-Windows-${{ steps.tag.outputs.version }}/ITStrategyAssessment-Windows-${{ steps.tag.outputs.version }}.zip
```

---

## 13. Implementation Order

Build in 8 sequential chunks. Each chunk should be fully functional before moving to the next.

### Chunk 1 — Project Scaffolding
- Initialize git repo, `.gitignore`, `requirements.txt`, `package.json`
- Backend: `main.py` with FastAPI skeleton, health check endpoint
- Frontend: Vite + React + TypeScript + Tailwind setup
- `build.py` with `--dev` and `--frontend` modes
- Verify: `python3 build.py --dev` serves empty app

### Chunk 2 — Data Model & Framework
- Backend: `models.py` with all Pydantic models
- Backend: `data_manager.py` (load/save/backup logic)
- Frontend: `types.ts` with all interfaces + constants
- Framework: `assessment-framework.json` with complete content (~350 items + ~50-75 extension items)
- API: `GET/PUT /api/assessment`, `GET /api/framework`
- Verify: API returns framework and saves/loads assessment

### Chunk 3 — State Management & Core Layout
- Frontend: `store.tsx` (Context + auto-save)
- Frontend: `api.ts` (fetch client)
- Frontend: `App.tsx` (router + sidebar + content layout)
- Frontend: `Sidebar.tsx` (collapsible, resizable, persistent)
- Pages: `ClientInfo.tsx`, `Dashboard.tsx` (basic)
- Verify: Navigate between pages, data persists

### Chunk 4 — Assessment Scoring UI
- Frontend: `scoring.ts` (all calculation functions)
- Components: `AssessmentItemCard.tsx`, `ScoringWidget.tsx`, `ConfidenceWidget.tsx`
- Pages: `PillarSummary.tsx`, `CapabilityArea.tsx` (keyboard shortcuts)
- Component: `Breadcrumb.tsx`
- Verify: Score items, see scores update in sidebar + dashboard

### Chunk 5 — Dashboard & Charts
- Dashboard: Radar chart (Recharts), bar chart, progress summary
- Dashboard: Maturity band display, top gaps list
- Component: `StatsFooter.tsx` (global progress + save status)
- Verify: Dashboard reflects scoring accurately

### Chunk 6 — Government Compliance Extension Module
- Backend: Extension models + framework loading (with sub-module toggles)
- Frontend: `GovComplianceSummary.tsx` + `GovComplianceSection.tsx`
- Sidebar: Main extension toggle + Federal/State sub-toggles + navigation
- Scoring: Extension scores (separate from composite unless specified)
- Verify: Toggle extension and sub-modules, score items, see results

### Chunk 7 — Exports
- Backend: `export_engine.py` — all 8 export generators (5 core + heatmap + quick-wins + compliance-mapping)
- Radar chart PNG generation (matplotlib)
- API: `POST /api/export/{type}`
- Frontend: `Export.tsx` page with buttons + validation
- Verify: Each export generates a real, correct file

### Chunk 8 — Polish & Packaging
- Components: `CommandPalette.tsx`, `OnboardingTooltip.tsx`
- Frontend: `validation.ts` + validation warnings in Export page
- Pages: `Settings.tsx` (weighting), `Help.tsx`
- PyInstaller specs + `build.py --dist`
- `README.txt` for end users
- Verify: Standalone executable runs, all features work

---

## 14. Reference Implementations

Use these existing tools as canonical examples. When in doubt, match their patterns exactly.

| Tool | Path | Hierarchy | Extension |
|------|------|-----------|-----------|
| Zero-Trust Assessment | `/Users/john/Dev/Assessments/Zero-Trust/` | Flat (Pillars + Cross-Cutting) | Classified Extension |
| ITSM Maturity Assessment | `/Users/john/Dev/Assessments/ITSM-ITIL/` | Grouped (Domain Groups → Domains) | ITIL 4 Module |

### Key Patterns to Replicate
- **Auto-save with debounce** — 300ms, immutable state updates via `structuredClone`
- **Sidebar resize + collapse** — drag handle, localStorage persistence, icon-only mode
- **Progress rings** — SVG circles in sidebar showing % complete per entity
- **Score color coding** — consistent colors across sidebar badges, charts, exports
- **Template fallback exports** — check for template file, auto-generate if missing
- **Port scanning** — try default port, increment up to +9 if occupied
- **SPA routing** — FastAPI serves `index.html` for all non-API routes
- **Backup on save** — always write `.bak` before overwriting main data file
- **Dark theme** — all colors from `Design-guide.md`, no light mode

### Deviations from Template Pattern
- **Sub-toggleable extension:** The Government Compliance extension has two independent sub-modules (Federal and State) with their own toggles, unlike the single-toggle extensions in Zero-Trust and ITSM. See the data model in Section 5 for the `ComplianceSubModule` pattern. The sidebar should show the main toggle and nested sub-toggles (see Section 8).

---

## Quick Start Checklist

1. ~~Copy this template~~ ✓
2. ~~Fill in all placeholder values~~ ✓
3. Write the full framework JSON content (~350 items + ~50-75 extension items with rubrics)
4. ~~Create the git repo and add as submodule~~ ✓
5. Follow the 8-chunk implementation order
6. Cross-reference the two existing tools whenever you need implementation details
