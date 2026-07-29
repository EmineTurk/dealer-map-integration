# Day 17 — Unified Orchestration with Docker Compose

## What I did today
Today I implemented the Day 17 task, which focuses on orchestrating the entire local development environment in a single command. Specifically:
- **API Gateway Containerization:** Created the missing multi-stage `Dockerfile` and `.dockerignore` files for `api-gateway` (listening on port `8085`).
- **Orchestrating the Stack:** Upgraded the root `docker-compose.yml` to spin up Oracle, Redis, the 3 backend microservices (`store-service`, `stock-service`, `capability-service`), the API Gateway, and the React frontend.
- **Service Dependency & Healthchecks:** Configured `healthcheck` scripts and `depends_on` conditions (`service_healthy`) to ensure that downstream services wait for database boot before starting.

## What I learned
- **Dependency Probes:** Simply starting containers together causes race conditions. Using health validation checks ensures that Java applications only start attempting connections once Oracle is fully booted and ready to accept sockets.
- **Microservices Routing under Docker Network:** Within the compose network, services resolve each other by container hostnames (e.g. `oracle:1521`, `store-service:8081`) rather than `localhost`, while the frontend bundle loaded in the browser continues to query `http://localhost:8085` since it runs in the client space.

## Questions & Struggles
- Tuning the start timeout periods on Oracle database initialization. The initial database bootstrapping is resource-heavy, so adjusting healthcheck parameters (`retries: 40`, `start_period: 180s`) was necessary to prevent Docker from aborting prematurely.

## For Tomorrow's Standup
- Ready for Day 18! The whole architecture is now containerized and easily testable under a single compose run.
