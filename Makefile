.PHONY: dev test migrate shell seed down

dev:
	cp -n .env.example .env || true
	docker compose up --build

test:
	docker compose run --rm api pytest tests/ -v --tb=short

migrate:
	docker compose run --rm api alembic upgrade head

shell:
	docker compose run --rm api bash

seed:
	docker compose run --rm api python -m app.scripts.seed

down:
	docker compose down -v
