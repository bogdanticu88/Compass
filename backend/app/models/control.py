from sqlalchemy import ARRAY, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, uuid_pk


class Control(Base, TimestampMixin):
    __tablename__ = "controls"

    id: Mapped[str] = uuid_pk()
    framework: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    article_ref: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    requirement: Mapped[str] = mapped_column(Text, nullable=False)
    evidence_types: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False, default=list)
