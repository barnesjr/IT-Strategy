IT Strategy Assessment Tool
============================

A standalone desktop application for conducting IT Strategy maturity
assessments aligned with TOGAF 10 Enterprise Architecture Framework.

FIRST RUN
---------

macOS:
  1. Open Terminal
  2. Navigate to this folder: cd /path/to/ITStrategyAssessment
  3. Remove quarantine: xattr -cr ./assessment-tool
  4. Run: ./assessment-tool
  Alternative: Right-click the executable in Finder > Open

Windows:
  1. Right-click assessment-tool.exe > Properties > check "Unblock" > OK
  2. Double-click to run
  Alternative: When SmartScreen appears, click "More info" > "Run anyway"
  PowerShell: Unblock-File .\assessment-tool.exe

Note: On devices managed by corporate MDM with strict execution policies
that block all unsigned executables, you may need to request an IT exception.

USAGE
-----

1. The application opens your browser to http://localhost:8761
2. Fill in Client Information
3. Navigate pillars via the sidebar
4. Score each assessment item (1-4 scale)
5. Set confidence levels and add notes/evidence
6. View progress on the Dashboard
7. Export deliverables from the Export page

All data is auto-saved to data.json in this folder.

NEW CLIENT ASSESSMENT
---------------------

Copy this entire folder and rename it for each client.
Each folder is a self-contained, independent assessment.

EXPORTS
-------

The tool generates 8 deliverables:
  D-01  Assessment Findings          (DOCX)
  D-02  Executive Summary            (DOCX)
  D-03  Gap Analysis & Roadmap       (DOCX)
  D-04  Scored Assessment Workbook   (XLSX)
  D-05  Out-Brief Presentation       (PPTX)
  D-06  Maturity Heatmap             (XLSX)
  D-07  Quick Wins Report            (DOCX)
  D-08  Compliance Mapping           (DOCX)

Exports are saved to the exports/ subdirectory with timestamped filenames.

TROUBLESHOOTING
---------------

Port in use: The tool tries ports 8761-8770 automatically.
If all ports are in use, close other instances first.

Data recovery: If data.json is corrupted, the tool will attempt to
load data.json.bak (created on each successful save).
