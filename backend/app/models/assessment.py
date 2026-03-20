import enum

from sqlalchemy import ARRAY, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, uuid_pk


class AssessmentStatus(str, enum.Enum):
    draft = "draft"
    in_review = "in_review"
    complete = "complete"


class Framework(str, enum.Enum):
    eu_ai_act = "eu_ai_act"
    dora = "dora"
    iso_42001 = "iso_42001"
    nist_ai_rmf = "nist_ai_rmf"


class Assessment(Base, TimestampMixin):
    __tablename__ = "assessments"

    id: Mapped[str] = uuid_pk()
    system_id: Mapped[str] = mapped_column(ForeignKey("ai_systems.id"), nullable=False)
    assessor_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    frameworks: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False)
    status: Mapped[AssessmentStatus] = mapped_column(
        Enum(AssessmentStatus), nullable=False, default=AssessmentStatus.draft
    )
    due_date: Mapped[str | None] = mapped_column(String(20))

    system: Mapped["AISystem"] = relationship("AISystem", back_populates="assessments")
    assessor: Mapped["User"] = relationship("User", foreign_keys=[assessor_id])
    findings: Mapped[list["Finding"]] = relationship(
        "Finding", back_populates="assessment"
    )
    evidence: Mapped[list["Evidence"]] = relationship(
        "Evidence", back_populates="assessment"
    )
