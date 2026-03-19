import enum

from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, uuid_pk


class Severity(str, enum.Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"


class FindingStatus(str, enum.Enum):
    open = "open"
    resolved = "resolved"


class Finding(Base, TimestampMixin):
    __tablename__ = "findings"

    id: Mapped[str] = uuid_pk()
    assessment_id: Mapped[str] = mapped_column(ForeignKey("assessments.id"), nullable=False)
    control_id: Mapped[str] = mapped_column(ForeignKey("controls.id"), nullable=False)
    severity: Mapped[Severity] = mapped_column(Enum(Severity), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    remediation_task: Mapped[str | None] = mapped_column(Text)
    status: Mapped[FindingStatus] = mapped_column(
        Enum(FindingStatus), nullable=False, default=FindingStatus.open
    )

    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="findings")
    control: Mapped["Control"] = relationship("Control")
