import enum

from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, uuid_pk


class RiskTier(str, enum.Enum):
    unacceptable = "unacceptable"
    high = "high"
    limited = "limited"
    minimal = "minimal"


class SystemStatus(str, enum.Enum):
    active = "active"
    decommissioned = "decommissioned"
    draft = "draft"


class AISystem(Base, TimestampMixin):
    __tablename__ = "ai_systems"

    id: Mapped[str] = uuid_pk()
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    risk_tier: Mapped[RiskTier] = mapped_column(Enum(RiskTier), nullable=False)
    business_unit: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[SystemStatus] = mapped_column(
        Enum(SystemStatus), nullable=False, default=SystemStatus.draft
    )

    owner: Mapped["User"] = relationship("User", foreign_keys=[owner_id])
    assessments: Mapped[list["Assessment"]] = relationship(
        "Assessment", back_populates="system"
    )
