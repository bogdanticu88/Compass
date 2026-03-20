from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, uuid_pk


class AssessmentControl(Base, TimestampMixin):
    """Records the assessor's response/notes for a specific control within an assessment."""
    __tablename__ = "assessment_controls"

    id: Mapped[str] = uuid_pk()
    assessment_id: Mapped[str] = mapped_column(ForeignKey("assessments.id"), nullable=False, index=True)
    control_id: Mapped[str] = mapped_column(ForeignKey("controls.id"), nullable=False, index=True)
    response_notes: Mapped[str | None] = mapped_column(Text)
    is_compliant: Mapped[bool | None] = mapped_column(default=None)

    assessment: Mapped["Assessment"] = relationship("Assessment")
    control: Mapped["Control"] = relationship("Control")
