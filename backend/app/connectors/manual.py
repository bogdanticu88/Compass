from typing import ClassVar
from app.connectors.base import BaseConnector, EvidenceItem, register


@register
class ManualConnector(BaseConnector):
    name = "manual"
    evidence_types: ClassVar[list[str]] = []

    async def collect(self, system_id: str, config: dict) -> list[EvidenceItem]:
        return []
