from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.connectors.base import CONNECTOR_REGISTRY
from app.models.connector_config import ConnectorConfig
from app.services.evidence import save_evidence_items


async def collect_evidence_job(ctx: dict, assessment_id: str, system_id: str) -> None:
    """
    ARQ job: runs all enabled connectors for a system and saves collected evidence.
    ctx["db_engine"] is set by WorkerSettings.on_startup.
    """
    engine = ctx["db_engine"]
    SessionMaker = async_sessionmaker(engine, expire_on_commit=False)

    async with SessionMaker() as db:
        result = await db.execute(
            select(ConnectorConfig).where(
                ConnectorConfig.system_id == system_id,
                ConnectorConfig.is_enabled == True,  # noqa: E712
            )
        )
        configs = result.scalars().all()

    for cfg in configs:
        connector_cls = CONNECTOR_REGISTRY.get(cfg.connector_name)
        if connector_cls is None:
            continue
        connector = connector_cls()
        items = await connector.collect(system_id, cfg.config)
        if items:
            async with SessionMaker() as db:
                await save_evidence_items(db, assessment_id, cfg.connector_name, items)
