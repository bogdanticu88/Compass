from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import ClassVar


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
