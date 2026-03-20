from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardStats
from app.services.auth import get_current_user
from app.services.dashboard import get_dashboard_stats

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> DashboardStats:
    stats = await get_dashboard_stats(db)
    return DashboardStats(**stats)
