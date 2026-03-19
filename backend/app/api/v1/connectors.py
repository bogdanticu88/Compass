from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.connector_config import ConnectorConfig
from app.models.user import User
from app.schemas.connector import ConnectorConfigCreate, ConnectorConfigRead
from app.services.auth import get_current_user

router = APIRouter(prefix="/systems/{system_id}/connectors", tags=["connectors"])


@router.get("", response_model=list[ConnectorConfigRead])
async def list_configs(
    system_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ConnectorConfig).where(ConnectorConfig.system_id == system_id)
    )
    return result.scalars().all()


@router.post("", response_model=ConnectorConfigRead, status_code=status.HTTP_201_CREATED)
async def create_config(
    system_id: str,
    body: ConnectorConfigCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cfg = ConnectorConfig(
        system_id=system_id,
        connector_name=body.connector_name,
        config=body.config,
        is_enabled=body.is_enabled,
    )
    db.add(cfg)
    await db.commit()
    await db.refresh(cfg)
    return cfg


@router.delete("/{connector_name}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_config(
    system_id: str,
    connector_name: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ConnectorConfig).where(
            ConnectorConfig.system_id == system_id,
            ConnectorConfig.connector_name == connector_name,
        )
    )
    cfg = result.scalar_one_or_none()
    if not cfg:
        raise HTTPException(status_code=404, detail="Connector config not found")
    await db.delete(cfg)
    await db.commit()
