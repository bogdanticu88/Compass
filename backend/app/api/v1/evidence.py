from fastapi import APIRouter, Depends, status
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.evidence import Evidence
from app.models.user import User
from app.schemas.evidence import EvidenceCreate, EvidenceRead
from app.services.auth import get_current_user

router = APIRouter(prefix="/evidence", tags=["evidence"])


@router.post("", response_model=EvidenceRead, status_code=status.HTTP_201_CREATED)
async def upload_evidence(
    body: EvidenceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload manual evidence for a specific control in an assessment."""
    # Delete any existing manual evidence for this assessment+control pair
    await db.execute(
        delete(Evidence).where(
            Evidence.assessment_id == body.assessment_id,
            Evidence.control_id == body.control_id,
            Evidence.source == "manual",
        )
    )
    evidence = Evidence(
        assessment_id=body.assessment_id,
        control_id=body.control_id,
        source="manual",
        payload=body.payload,
        status="collected",
    )
    db.add(evidence)
    await db.commit()
    await db.refresh(evidence)
    return evidence
