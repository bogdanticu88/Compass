from arq.connections import RedisSettings
from sqlalchemy.ext.asyncio import create_async_engine

from app.config import settings
from app.workers.evidence import collect_evidence_job


async def startup(ctx: dict) -> None:
    ctx["db_engine"] = create_async_engine(settings.database_url)


async def shutdown(ctx: dict) -> None:
    await ctx["db_engine"].dispose()


class WorkerSettings:
    functions = [collect_evidence_job]
    on_startup = startup
    on_shutdown = shutdown
    redis_settings = RedisSettings.from_dsn(settings.redis_url)
