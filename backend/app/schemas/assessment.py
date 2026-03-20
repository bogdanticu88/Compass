from pydantic import BaseModel


class AssessmentCreate(BaseModel):
    system_id: str
    frameworks: list[str]
    due_date: str | None = None


class AssessmentRead(BaseModel):
    id: str
    system_id: str
    assessor_id: str
    frameworks: list[str]
    status: str
    due_date: str | None

    model_config = {"from_attributes": True}


class ControlInAssessment(BaseModel):
    id: str
    framework: str
    article_ref: str
    title: str
    requirement: str
    evidence_status: str  # "collected" | "stale" | "missing"
    evidence_payload: str | None = None
    evidence_source: str | None = None

    model_config = {"from_attributes": True}


class AssessmentDetail(AssessmentRead):
    controls: list[ControlInAssessment]
