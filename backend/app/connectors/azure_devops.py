import base64
import json
import logging
from datetime import datetime, UTC
from typing import ClassVar

import httpx

from app.connectors.base import BaseConnector, EvidenceItem, get_controls_for_types, register

AZURE_DEVOPS_API = "https://dev.azure.com"
logger = logging.getLogger(__name__)


@register
class AzureDevOpsConnector(BaseConnector):
    name = "azure_devops"
    evidence_types: ClassVar[list[str]] = [
        "audit_logs",
        "monitoring_logs",
        "robustness_tests",
        "model_versioning_records",
    ]

    async def collect(self, system_id: str, config: dict) -> list[EvidenceItem]:
        organization = config.get("organization")
        project = config.get("project")
        token = config.get("token")
        if not organization or not project or not token:
            return []

        credentials = base64.b64encode(f":{token}".encode()).decode()
        headers = {
            "Authorization": f"Basic {credentials}",
            "Accept": "application/json",
        }

        builds_data: list[dict] = []
        releases_data: list[dict] = []

        try:
            async with httpx.AsyncClient(headers=headers, timeout=30) as client:
                builds_resp = await client.get(
                    f"{AZURE_DEVOPS_API}/{organization}/{project}/_apis/build/builds",
                    params={"api-version": "7.1", "$top": "20"},
                )
                builds_resp.raise_for_status()
                builds_data = builds_resp.json().get("value", [])

                releases_resp = await client.get(
                    f"{AZURE_DEVOPS_API}/{organization}/{project}/_apis/release/releases",
                    params={"api-version": "7.1", "$top": "10"},
                )
                releases_resp.raise_for_status()
                releases_data = releases_resp.json().get("value", [])
        except httpx.HTTPStatusError as exc:
            logger.error(
                "Azure DevOps API returned %s for %s/%s — check token/permissions",
                exc.response.status_code,
                organization,
                project,
            )
            return []
        except Exception:
            logger.exception(
                "Azure DevOps API request failed for %s/%s (network/timeout)",
                organization,
                project,
            )
            return []

        collected_at = datetime.now(UTC).isoformat()

        payloads: dict[str, str] = {
            "audit_logs": json.dumps({
                "builds": [
                    {
                        "id": b["id"],
                        "buildNumber": b.get("buildNumber"),
                        "result": b.get("result"),
                        "startTime": b.get("startTime"),
                    }
                    for b in builds_data
                ],
                "collected_at": collected_at,
            }),
            "monitoring_logs": json.dumps({
                "recent_builds": len(builds_data),
                "last_result": builds_data[0].get("result") if builds_data else None,
                "collected_at": collected_at,
            }),
            "robustness_tests": json.dumps({
                "test_builds": [
                    {
                        "id": b["id"],
                        "buildNumber": b.get("buildNumber"),
                        "result": b.get("result"),
                        "startTime": b.get("startTime"),
                    }
                    for b in builds_data
                    if "test" in (b.get("definition", {}) or {}).get("name", "").lower()
                ],
                "collected_at": collected_at,
            }),
            "model_versioning_records": json.dumps({
                "releases": [
                    {
                        "id": r["id"],
                        "name": r.get("name"),
                        "createdOn": r.get("createdOn"),
                        "definitionName": (r.get("releaseDefinition") or {}).get("name"),
                    }
                    for r in releases_data
                ],
                "collected_at": collected_at,
            }),
        }

        controls = await get_controls_for_types(self.evidence_types)
        items: list[EvidenceItem] = []

        for control in controls:
            for et in control.evidence_types:
                if et in payloads:
                    items.append(EvidenceItem(
                        control_id=control.id,
                        source="azure_devops",
                        payload=payloads[et],
                        status="collected",
                    ))
                    break  # one evidence item per control

        return items
