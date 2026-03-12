import json
import os
import shutil
import tempfile
from pathlib import Path
from datetime import datetime
try:
    from .models import (
        AssessmentData, AssessmentItem, CapabilityArea, Pillar,
        ComplianceSection, ComplianceSubModule, GovComplianceExtension,
        ClientInfo, AssessmentMetadata, ScoringConfig,
    )
except ImportError:
    from models import (
        AssessmentData, AssessmentItem, CapabilityArea, Pillar,
        ComplianceSection, ComplianceSubModule, GovComplianceExtension,
        ClientInfo, AssessmentMetadata, ScoringConfig,
    )


class DataManager:
    def __init__(self, base_dir: str, resource_dir: str | None = None):
        self.base_dir = Path(base_dir)
        res = Path(resource_dir) if resource_dir else self.base_dir
        self.data_path = self.base_dir / "data.json"
        self.backup_path = self.base_dir / "data.json.bak"
        self.framework_path = res / "framework" / "assessment-framework.json"
        self.exports_dir = self.base_dir / "exports"
        self.templates_dir = res / "templates"
        self._framework: dict | None = None

    def load_framework(self) -> dict:
        if self._framework is None:
            with open(self.framework_path, "r") as f:
                self._framework = json.load(f)
        return self._framework

    def _create_empty_item(self, fw_item: dict) -> dict:
        return {
            "id": fw_item["id"],
            "text": fw_item["text"],
            "score": None,
            "na": False,
            "na_justification": None,
            "confidence": None,
            "notes": "",
            "evidence_references": [],
            "attachments": [],
        }

    def create_empty_assessment(self) -> AssessmentData:
        fw = self.load_framework()

        pillars = []
        for fw_pillar in fw["pillars"]:
            cas = []
            for fw_ca in fw_pillar["capability_areas"]:
                items = [AssessmentItem(**self._create_empty_item(fi)) for fi in fw_ca["items"]]
                cas.append(CapabilityArea(id=fw_ca["id"], name=fw_ca["name"], items=items))
            pillars.append(Pillar(
                id=fw_pillar["id"],
                name=fw_pillar["name"],
                weight=fw_pillar["weight"],
                capability_areas=cas,
            ))

        # Initialize Gov Compliance from framework
        gov_ext = fw.get("gov_compliance_extension", {})
        federal_sections = []
        for fw_section in gov_ext.get("federal", {}).get("sections", []):
            cas = []
            for fw_ca in fw_section.get("capability_areas", []):
                items = [AssessmentItem(**self._create_empty_item(fi)) for fi in fw_ca["items"]]
                cas.append(CapabilityArea(id=fw_ca["id"], name=fw_ca["name"], items=items))
            federal_sections.append(ComplianceSection(id=fw_section["id"], name=fw_section["name"], capability_areas=cas))

        state_sections = []
        for fw_section in gov_ext.get("state", {}).get("sections", []):
            cas = []
            for fw_ca in fw_section.get("capability_areas", []):
                items = [AssessmentItem(**self._create_empty_item(fi)) for fi in fw_ca["items"]]
                cas.append(CapabilityArea(id=fw_ca["id"], name=fw_ca["name"], items=items))
            state_sections.append(ComplianceSection(id=fw_section["id"], name=fw_section["name"], capability_areas=cas))

        gov_compliance = GovComplianceExtension(
            enabled=False,
            federal=ComplianceSubModule(enabled=False, sections=federal_sections),
            state=ComplianceSubModule(enabled=False, sections=state_sections),
        )

        target_scores = {p["id"]: 3.0 for p in fw["pillars"]}

        return AssessmentData(
            client_info=ClientInfo(assessment_date=datetime.now().strftime("%Y-%m-%d")),
            assessment_metadata=AssessmentMetadata(),
            scoring_config=ScoringConfig(),
            pillars=pillars,
            gov_compliance_enabled=False,
            gov_compliance_extension=gov_compliance,
            target_scores=target_scores,
        )

    def load_assessment(self) -> AssessmentData:
        if not self.data_path.exists():
            data = self.create_empty_assessment()
            self.save_assessment(data)
            return data

        try:
            with open(self.data_path, "r") as f:
                raw = json.load(f)
            return AssessmentData(**raw)
        except (json.JSONDecodeError, Exception):
            # Try backup
            if self.backup_path.exists():
                try:
                    with open(self.backup_path, "r") as f:
                        raw = json.load(f)
                    return AssessmentData(**raw)
                except Exception:
                    pass
            # Create fresh
            data = self.create_empty_assessment()
            self.save_assessment(data)
            return data

    def save_assessment(self, data: AssessmentData) -> None:
        data.assessment_metadata.last_modified = datetime.now().isoformat()
        self.exports_dir.mkdir(exist_ok=True)

        # Backup existing file
        if self.data_path.exists():
            shutil.copy2(self.data_path, self.backup_path)

        # Atomic write: write to temp, then rename
        fd, tmp_path = tempfile.mkstemp(
            dir=str(self.base_dir), suffix=".json.tmp"
        )
        try:
            with os.fdopen(fd, "w") as f:
                json.dump(data.model_dump(), f, indent=2, default=str)
            os.replace(tmp_path, str(self.data_path))
        except Exception:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
            raise
