from typing import ClassVar
from app.connectors.base import BaseConnector, EvidenceItem, register


@register
class GitHubConnector(BaseConnector):
    name = "github"
    evidence_types: ClassVar[list[str]] = ["audit_logs", "monitoring_logs", "robustness_tests", "model_versioning_records"]

    async def collect(self, system_id: str, config: dict) -> list[EvidenceItem]:
        return []
