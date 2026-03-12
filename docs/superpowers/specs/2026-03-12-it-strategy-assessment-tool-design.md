# IT Strategy Assessment Tool — Design Spec

## Overview

Desktop assessment tool for evaluating organizational IT strategy maturity against TOGAF 10. Standalone application built with FastAPI (Python backend) + React 19 (TypeScript frontend), packaged via PyInstaller for macOS and Windows distribution.

**Implementation approach:** Clone the Zero-Trust assessment tool and adapt. Both use flat hierarchy, same tech stack, same design system. Key adaptations are structural (7 pillars vs 5, Gov Compliance vs Classified Extension, scoring integration).

## Architecture

### Hierarchy: Flat (2-level nesting)

```
Pillar (7, scored + weighted)
  └── Capability Area
       └── Assessment Item (~50 items per pillar, ~350 total)
```

No cross-cutting capabilities (Zero-Trust's 3 cross-cutting sections are removed entirely).

### 7 Pillars

| Pillar | ID | Default Weight |
|---|---|---|
| Governance & Oversight | `governance` | 0.15 |
| Strategy & Planning | `strategy` | 0.15 |
| Enterprise Architecture | `enterprise-architecture` | 0.15 |
| Service Management | `service-management` | 0.14 |
| Infrastructure & Cloud | `infrastructure-cloud` | 0.14 |
| Workforce & Culture | `workforce-culture` | 0.13 |
| Innovation & Digital | `innovation-digital` | 0.14 |

### Scoring

- **Scale:** 1–4 (Initial, Developing, Established, Optimizing)
- **Score colors:** 1=`#ef4444`, 2=`#f97316`, 3=`#84cc16`, 4=`#22c55e`
- **Maturity bands:** 6 levels — Reactive, Emerging, Developing, Established, Managed, Optimizing
- **Weighting models:** 5 presets (Balanced, Strategy-Heavy, Operations-Heavy, Modernization, Governance-First) + custom
- **Default target:** 3.0 per pillar

### Framework Alignment

TOGAF 10 — all assessment items and rubrics are aligned to TOGAF 10 practices and terminology.

---

## Government Compliance Extension

Replaces Zero-Trust's Classified Extension. Key structural differences:

1. **Sub-toggleable:** Main toggle + independent Federal/State sub-toggles (Classified was single toggle)
2. **Contributes to composite score** when enabled (Classified had a separate "Posture Index")
3. **Has capability areas** within sections (Classified was flat items only)

### Data Model

```
GovComplianceExtension
  ├── enabled: bool
  ├── federal: ComplianceSubModule
  │     ├── enabled: bool
  │     └── sections[4]:
  │           fitara-compliance (FITARA Compliance)
  │           it-investment-management (IT Investment Management)
  │           acquisition-procurement (Acquisition & Procurement)
  │           cybersecurity-governance (Cybersecurity Governance)
  │         └── capability_areas[] → items[]
  └── state: ComplianceSubModule
        ├── enabled: bool
        └── sections[3]:
              ea-maturity (EA Maturity)
              portfolio-management (Portfolio Management)
              digital-services (Digital Services)
            └── capability_areas[] → items[]
```

### Toggle Behavior

- Main toggle enables/disables the entire module
- Each sub-toggle (Federal, State) independently enables/disables its sub-module
- Turning off the main toggle hides everything; turning it back on restores previous sub-toggle states
- Sidebar shows main toggle + nested sub-toggles with section navigation underneath

### Scoring Integration

When Gov Compliance sub-modules are enabled, their scores contribute to the weighted composite:

1. Calculate pillar scores: `Σ(pillarScore × pillarWeight)` for 7 pillars
2. Calculate Gov Compliance score: average of all scored items across enabled sections (Federal, State, or both)
3. Gov Compliance receives a fixed weight of `0.10`. All 7 pillar weights are scaled by `0.9 / sumOfPillarWeights` so pillars sum to 0.9, Gov Compliance adds 0.10, total = 1.0
4. If Gov Compliance is enabled but has no scored items yet, it is excluded from the composite (same pattern as unscored pillars — only include entities with at least one scored item)
5. Radar chart shows 7 axes normally, or 8 axes (+ single "Gov Compliance" axis) when any sub-module is enabled. The Gov Compliance axis shows the combined average of all enabled sub-module scores regardless of which sub-modules are active

**Example:** With balanced weights (each pillar = 0.143), enabling Gov Compliance scales each pillar to `0.143 × 0.9 = 0.1287`, and Gov Compliance gets `0.10`. Sum: `7 × 0.1287 + 0.10 = 1.0009 ≈ 1.0`.

---

## Frontend Routing

```
/                                    → ClientInfo
/dashboard                           → Dashboard
/pillars/:entityId                   → PillarSummary
/pillars/:entityId/:areaId           → CapabilityArea (main scoring page)
/gov-compliance                      → GovComplianceSummary
/gov-compliance/:sectionId           → GovComplianceSection
/gov-compliance/:sectionId/:areaId   → GovComplianceSection (area detail)
/export                              → Export
/settings                            → Settings
/help                                → Help
```

Removed from Zero-Trust: `/cross-cutting/*`, `/classified`

---

## Sidebar Structure

```
[Logo ~160px]
──────────────────
Client Info          → /
Dashboard            → /dashboard
──────────────────
Pillar 1: GOVERNANCE & OVERSIGHT        [score] [ring] [chevron]
  ├── Capability Area 1                 [score] [ring]
  ├── Capability Area 2                 [score] [ring]
  └── ...
Pillar 2: STRATEGY & PLANNING          [score] [ring] [chevron]
  └── ...
Pillar 3: ENTERPRISE ARCHITECTURE      ...
Pillar 4: SERVICE MANAGEMENT           ...
Pillar 5: INFRASTRUCTURE & CLOUD       ...
Pillar 6: WORKFORCE & CULTURE          ...
Pillar 7: INNOVATION & DIGITAL         ...
──────────────────
Gov Compliance  [main toggle]
  ├── Federal (FITARA)  [sub-toggle]
  │     ├── FITARA Compliance           [score] [ring]
  │     ├── IT Investment Management    [score] [ring]
  │     ├── Acquisition & Procurement   [score] [ring]
  │     └── Cybersecurity Governance    [score] [ring]
  └── State (NASCIO)    [sub-toggle]
        ├── EA Maturity                 [score] [ring]
        ├── Portfolio Management        [score] [ring]
        └── Digital Services            [score] [ring]
──────────────────
Export               → /export
Settings             → /settings
Help                 → /help
```

- **Collapsible:** 56px icon-only ↔ full width
- **Resizable:** Drag right edge (220px–480px, default 350px)
- **Persist:** `localStorage` key `"it-strategy-sidebar"`
- **Progress rings:** SVG circle, % scored per entity
- **Score badges:** Rounded average, color-coded

---

## Exports (8 total)

### Core (adapted from Zero-Trust)

| # | Name | Format | Content |
|---|------|--------|---------|
| 1 | Assessment Findings | DOCX | Per-pillar item breakdown with scores, notes, evidence |
| 2 | Executive Summary | DOCX | Composite score, radar chart (embedded PNG), top gaps |
| 3 | Gap Analysis & Roadmap | DOCX | Gap matrix (current vs target), remediation timeline |
| 4 | Scored Assessment Workbook | XLSX | Dashboard + per-pillar sheets with all items |
| 5 | Out-Brief Presentation | PPTX | Title + overview + radar chart + per-pillar slides |

### Domain-Specific (new)

| # | Name | Format | Content |
|---|------|--------|---------|
| 6 | Maturity Heatmap | XLSX | Pillar × Capability Area color-coded score grid |
| 7 | Quick Wins Report | DOCX | Low-score, high-impact items prioritized for quick remediation |
| 8 | Compliance Mapping | DOCX | Maps scores to TOGAF 10 requirements + government mandates |

All exports include Gov Compliance data when enabled. Filenames: `D-XX_Name_YYYY-MM-DD_HHMMSS.ext`.

---

## Key Adaptations from Zero-Trust

| Aspect | Zero-Trust | IT-Strategy |
|--------|-----------|-------------|
| Pillars | 5 | 7 |
| Cross-cutting | 3 sections | None |
| Extension | Classified (single toggle, flat items, separate score) | Gov Compliance (sub-toggles, has CAs, contributes to composite) |
| Framework | CISA ZTMM v2.0 | TOGAF 10 |
| Rubric keys | traditional/initial/advanced/optimal | initial/developing/established/optimizing |
| Score labels | Traditional/Initial/Advanced/Optimal | Initial/Developing/Established/Optimizing |
| Weighting models | 5 (identity-focused) | 5 (strategy/ops/modernization-focused) |
| Exports | 5 | 8 (5 core + 3 domain-specific) |
| Port | 8741–8750 | 8761–8770 |
| localStorage key | `zt-sidebar` | `it-strategy-sidebar` |
| Distribution name | ZeroTrustAssessment | ITStrategyAssessment |

---

## Implementation Order

Follow the spec's 8-chunk sequential order. Each chunk must be fully functional before proceeding.

1. **Project Scaffolding** — git, deps, FastAPI skeleton, Vite+React setup, build.py
2. **Data Model & Framework** — Pydantic models, data_manager, types.ts, framework JSON (~350 + ~60 items), API routes
3. **State Management & Core Layout** — store.tsx, api.ts, App.tsx, Sidebar.tsx, ClientInfo, basic Dashboard
4. **Assessment Scoring UI** — scoring.ts, item cards, scoring/confidence widgets, PillarSummary, CapabilityArea, keyboard shortcuts
5. **Dashboard & Charts** — radar chart, bar chart, maturity bands, progress, StatsFooter
6. **Gov Compliance Extension** — backend models, frontend pages, sidebar sub-toggles, scoring integration into composite
7. **Exports** — export_engine.py (8 generators), radar PNG, export API, Export page
8. **Polish & Packaging** — CommandPalette, validation, Settings, Help, PyInstaller specs, build.py --dist, README.txt, GitHub Actions

---

## Framework Content

~350 assessment items across 7 pillars + ~60 Gov Compliance items, all with 4-level rubrics (initial/developing/established/optimizing) aligned to TOGAF 10.

### Pillar Breakdown (~50 items each)

1. **Governance & Oversight** — IT governance structure, decision-making authority, policy management, executive alignment, performance oversight, risk governance, compliance management
2. **Strategy & Planning** — Strategic planning processes, business-IT alignment, roadmap development, portfolio prioritization, value realization, stakeholder engagement, strategic communication
3. **Enterprise Architecture** — TOGAF ADM adoption, architecture governance, standards management, technology radar, reference architectures, architecture repository, capability modeling
4. **Service Management** — IT service catalog, SLA management, incident/problem processes, service desk maturity, customer satisfaction, service improvement, vendor management
5. **Infrastructure & Cloud** — Cloud strategy, infrastructure modernization, platform engineering, technical debt management, capacity planning, disaster recovery, DevOps practices
6. **Workforce & Culture** — IT skills assessment, training programs, talent retention, organizational design, change management, collaboration, diversity & inclusion
7. **Innovation & Digital** — Innovation pipeline, emerging technology evaluation, digital transformation roadmap, citizen/customer experience, data-driven decision-making, agile practices, continuous improvement

### Gov Compliance Extension (~60 items)

**Federal sub-module (~40 items):**
- FITARA Compliance — CIO authority, IT spending transparency, risk management, workforce planning
- IT Investment Management — Portfolio selection, business case development, investment control, post-implementation review (GAO ITIM aligned)
- Acquisition & Procurement — IT acquisition strategy, modular contracting, vendor diversity, contract management
- Cybersecurity Governance — FISMA compliance, FedRAMP alignment, security program maturity, incident response

**State sub-module (~20 items):**
- EA Maturity — Architecture practice establishment, standards adoption, governance integration (NASCIO aligned)
- Portfolio Management — IT portfolio visibility, project prioritization, ROI tracking
- Digital Services — Citizen-facing modernization, accessibility compliance, digital equity

---

## Tech Stack

Identical to Zero-Trust (no substitutions):

**Backend:** Python 3, FastAPI, Uvicorn, Pydantic v2, openpyxl, docxtpl, python-pptx, matplotlib (Agg), PyInstaller
**Frontend:** React 19, TypeScript 5.9+, Vite 7, Tailwind CSS 4, Recharts, Lucide React, React Router 7

---

## Design System

Follows shared Peraton design system from `/Users/john/Dev/Assessments/Design-guide.md`:

- Dark mode: page bg `#0A0A0B`, surfaces `#131212`/`#1C1C1E`/`#262626`/`#333333`
- Primary accent: `#1BA1E2` (Peraton Cyan)
- Text: `#FFFFFF` primary, `#D0D0D0` secondary
- Font: Segoe UI with system fallbacks
- Logo: White PNG, ~160px sidebar, ~300px loading screen
