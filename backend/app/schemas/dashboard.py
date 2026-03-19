from pydantic import BaseModel


class OverdueAssessment(BaseModel):
    id: str
    system_id: str
    due_date: str
    status: str


class DashboardStats(BaseModel):
    framework_compliance: dict[str, float | None]
    overdue_assessments: list[OverdueAssessment]
