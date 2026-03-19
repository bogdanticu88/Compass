from pydantic import BaseModel


class EvidenceCreate(BaseModel):
    assessment_id: str
    control_id: str
    payload: str


class EvidenceRead(BaseModel):
    id: str
    assessment_id: str
    control_id: str
    source: str
    payload: str | None
    status: str

    model_config = {"from_attributes": True}
