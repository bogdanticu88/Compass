import enum

from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, uuid_pk


class EvidenceStatus(str, enum.Enum):
    collected = "collected"
    stale = "stale"
    missing = "missing"


class Evidence(Base, TimestampMixin):
    __tablename__ = "evidence"

    id: Mapped[str] = uuid_pk()
    assessment_id: Mapped[str] = mapped_column(ForeignKey("assessments.id"), nullable=False)
    control_id: Mapped[str] = mapped_column(ForeignKey("controls.id"), nullable=False)
    source: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[str | None] = mapped_column(Text)
    status: Mapped[EvidenceStatus] = mapped_column(
        Enum(EvidenceStatus), nullable=False, default=EvidenceStatus.collected
    )

    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="evidence")
    control: Mapped["Control"] = relationship("Control")
