import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import ClassVar

from sqlalchemy import ARRAY, String, cast, select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

_base_logger = logging.getLogger(__name__)


@dataclass
class EvidenceItem:
    control_id: str
    source: str
    payload: str
    status: str = "collected"


class BaseConnector(ABC):
    name: ClassVar[str]
    evidence_types: ClassVar[list[str]]

    @abstractmethod
    async def collect(self, system_id: str, config: dict) -> list[EvidenceItem]:
        """Collect evidence for the given system using the provided config."""
        ...


CONNECTOR_REGISTRY: dict[str, type[BaseConnector]] = {}


def register(cls: type[BaseConnector]) -> type[BaseConnector]:
    if cls.name in CONNECTOR_REGISTRY:
        raise ValueError(f"Connector name '{cls.name}' is already registered")
    CONNECTOR_REGISTRY[cls.name] = cls
    return cls


async def get_controls_for_types(evidence_types: list[str]) -> list:
    """Load controls from DB whose evidence_types overlap with the given list.

    Creates its own engine so connectors (which run inside ARQ workers without
    a request-scoped DB session) can still query controls.
    """
    from app.config import settings
    from app.models.control import Control

    engine = create_async_engine(settings.database_url)
    SessionMaker = async_sessionmaker(engine, expire_on_commit=False)
    async with SessionMaker() as db:
        result = await db.execute(
            select(Control).where(
                Control.evidence_types.overlap(cast(evidence_types, ARRAY(String)))
            )
        )
        controls = result.scalars().all()
    await engine.dispose()
    return list(controls)
