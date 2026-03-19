from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.finding import Finding
from app.models.user import User
from app.schemas.finding import FindingRead
from app.services.auth import get_current_user

router = APIRouter(prefix="/findings", tags=["findings"])


@router.get("", response_model=list[FindingRead])
async def list_findings(
    assessment_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Finding)
    if assessment_id:
        query = query.where(Finding.assessment_id == assessment_id)
    result = await db.execute(query.order_by(Finding.created_at.desc()))
    return result.scalars().all()
