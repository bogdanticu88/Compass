from datetime import date

from sqlalchemy import any_, cast, func, select
from sqlalchemy.dialects.postgresql import ARRAY as PG_ARRAY
from sqlalchemy import String
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.assessment import Assessment
from app.models.control import Control
from app.models.evidence import Evidence, EvidenceStatus

FRAMEWORKS = ["eu_ai_act", "dora", "iso_42001", "nist_ai_rmf"]


async def get_dashboard_stats(db: AsyncSession) -> dict:
    framework_compliance: dict[str, float | None] = {}

    for fw in FRAMEWORKS:
        # Only submitted assessments count toward compliance
        assessments_result = await db.execute(
            select(Assessment).where(
                fw == any_(Assessment.frameworks),
                Assessment.status.in_(["in_review", "complete"]),
            )
        )
        fw_assessments = assessments_result.scalars().all()

        if not fw_assessments:
            framework_compliance[fw] = None
            continue

        total_controls_result = await db.execute(
            select(func.count()).select_from(Control).where(Control.framework == fw)
        )
        total_controls = total_controls_result.scalar() or 0

        if total_controls == 0:
            framework_compliance[fw] = None
            continue

        coverage_rates: list[float] = []
        for assessment in fw_assessments:
            covered_result = await db.execute(
                select(func.count()).select_from(Evidence).join(
                    Control, Evidence.control_id == Control.id
                ).where(
                    Evidence.assessment_id == assessment.id,
                    Evidence.status == EvidenceStatus.collected,
                    Control.framework == fw,
                )
            )
            covered = covered_result.scalar() or 0
            coverage_rates.append(min(covered / total_controls, 1.0))

        framework_compliance[fw] = round(
            sum(coverage_rates) / len(coverage_rates), 2
        )

    today = date.today().isoformat()
    overdue_result = await db.execute(
        select(Assessment).where(
            Assessment.due_date.isnot(None),
            Assessment.due_date < today,
            Assessment.status != "complete",
        )
    )
    overdue = overdue_result.scalars().all()

    return {
        "framework_compliance": framework_compliance,
        "overdue_assessments": [
            {
                "id": a.id,
                "system_id": a.system_id,
                "due_date": a.due_date,
                "status": a.status.value,
            }
            for a in overdue
        ],
    }
