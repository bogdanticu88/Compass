from pydantic import BaseModel


class FindingRead(BaseModel):
    id: str
    assessment_id: str
    control_id: str
    severity: str
    description: str
    remediation_task: str | None
    status: str

    model_config = {"from_attributes": True}
