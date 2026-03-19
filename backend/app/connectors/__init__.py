from app.connectors.base import BaseConnector, EvidenceItem, CONNECTOR_REGISTRY
from app.connectors.manual import ManualConnector
from app.connectors.github import GitHubConnector
from app.connectors.azure_devops import AzureDevOpsConnector  # noqa: F401 — side-effect: registers connector

__all__ = ["BaseConnector", "EvidenceItem", "CONNECTOR_REGISTRY", "ManualConnector", "GitHubConnector", "AzureDevOpsConnector"]
