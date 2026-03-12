from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


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
    confidence: Optional[str] = Field(None, pattern="^(High|Medium|Low)$")
    notes: str = ""
    evidence_references: list[EvidenceReference] = Field(default_factory=list)
    attachments: list[str] = Field(default_factory=list)


class CapabilityArea(BaseModel):
    id: str
    name: str
    items: list[AssessmentItem] = Field(default_factory=list)


class Pillar(BaseModel):
    id: str
    name: str
    weight: float = 0.0
    capability_areas: list[CapabilityArea] = Field(default_factory=list)


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


class ClientInfo(BaseModel):
    name: str = ""
    industry: str = ""
    assessment_date: str = ""
    assessor: str = ""


class AssessmentMetadata(BaseModel):
    framework_version: str = "1.0"
    tool_version: str = "1.0.0"
    last_modified: str = Field(default_factory=lambda: datetime.now().isoformat())


class ScoringConfig(BaseModel):
    weighting_model: str = "balanced"
    pillar_weights: dict[str, float] = Field(default_factory=lambda: {
        "governance": 0.15, "strategy": 0.15, "enterprise-architecture": 0.15,
        "service-management": 0.14, "infrastructure-cloud": 0.14,
        "workforce-culture": 0.13, "innovation-digital": 0.14
    })
    custom_weights: Optional[dict[str, float]] = None


class AssessmentData(BaseModel):
    client_info: ClientInfo = Field(default_factory=ClientInfo)
    assessment_metadata: AssessmentMetadata = Field(default_factory=AssessmentMetadata)
    scoring_config: ScoringConfig = Field(default_factory=ScoringConfig)
    pillars: list[Pillar] = Field(default_factory=list)
    gov_compliance_enabled: bool = False
    gov_compliance_extension: Optional[GovComplianceExtension] = None
    target_scores: dict[str, float] = Field(default_factory=dict)
