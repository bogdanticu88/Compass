import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.assessment import Assessment
from app.models.control import Control
from app.models.evidence import Evidence
from app.models.finding import Finding, FindingStatus, Severity
from app.services.evidence import enqueue_collection

logger = logging.getLogger(__name__)


def _evidence_status(evidence) -> str:
    if evidence is None:
        return "missing"
    stale_threshold = datetime.now(timezone.utc) - timedelta(days=settings.evidence_stale_days)
    created_at = evidence.created_at
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    if created_at < stale_threshold:
        return "stale"
    return str(evidence.status)


async def create_assessment(db: AsyncSession, system_id: str, assessor_id: str, frameworks: list[str], due_date: str | None) -> Assessment:
    assessment = Assessment(
        system_id=system_id,
        assessor_id=assessor_id,
        frameworks=frameworks,
        due_date=due_date,
    )
    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)

    # Trigger evidence collection in background (best-effort — Redis may be unavailable in test env)
    try:
        await enqueue_collection(assessment.id, system_id)
    except Exception as exc:
        logger.warning("Evidence collection enqueue failed (non-fatal): %s", exc)

    return assessment


async def get_assessment_detail(db: AsyncSession, assessment_id: str) -> dict | None:
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()
    if not assessment:
        return None

    controls_result = await db.execute(
        select(Control).where(Control.framework.in_(assessment.frameworks))
    )
    controls = controls_result.scalars().all()

    evidence_result = await db.execute(
        select(Evidence).where(Evidence.assessment_id == assessment_id)
    )
    evidence_by_control = {e.control_id: e for e in evidence_result.scalars().all()}

    controls_with_status = [
        {
            "id": c.id,
            "framework": c.framework,
            "article_ref": c.article_ref,
            "title": c.title,
            "requirement": c.requirement,
            "evidence_status": _evidence_status(evidence_by_control.get(c.id)),
        }
        for c in controls
    ]

    return {
        "id": assessment.id,
        "system_id": assessment.system_id,
        "assessor_id": assessment.assessor_id,
        "frameworks": assessment.frameworks,
        "status": assessment.status,
        "due_date": assessment.due_date,
        "controls": controls_with_status,
    }


async def submit_assessment(db: AsyncSession, assessment_id: str) -> Assessment | None:
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()
    if not assessment:
        return None

    controls_result = await db.execute(
        select(Control).where(Control.framework.in_(assessment.frameworks))
    )
    controls = controls_result.scalars().all()

    evidence_result = await db.execute(
        select(Evidence).where(Evidence.assessment_id == assessment_id)
    )
    covered_control_ids = {e.control_id for e in evidence_result.scalars().all()}

    for control in controls:
        if control.id not in covered_control_ids:
            finding = Finding(
                assessment_id=assessment_id,
                control_id=control.id,
                severity=Severity.high,
                description=f"No evidence collected for: {control.title} ({control.article_ref})",
                status=FindingStatus.open,
            )
            db.add(finding)

    assessment.status = "in_review"
    await db.commit()
    await db.refresh(assessment)
    return assessment
