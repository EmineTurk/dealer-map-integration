# Dealer Map Integration

This project is developed for Turkcell dealer map integration.

The main goal is to show users the nearest suitable dealers on a map.

## Main Scenarios

- **Pasaj — Nearby Stock:** Users can see which dealers have the selected product in stock.
- **turkcell.com.tr — Nearby Service:** Users can see the nearest dealers that can perform the selected operation.

## Project Structure

```txt
dealer-map-integration
├── docker-compose.yml   (Oracle Free — Gün 3)
├── stock-service        (port 8080 — Pasaj / Backend A)
├── store-service        (port 8081 — Bayi master data / Backend B)
├── capability-service   (Hafta 2 — Backend B)
├── frontend
└── docs
```

## Local Oracle (Day 3)

```bash
docker compose up -d oracle
```

- Port: `1521` / Service: `FREEPDB1`
- App user: `store_app` / `StoreApp123`
- `STORE` DDL: `store-service/sql/01_create_store_table.sql`
- API contract: [`docs/api-contract.md`](docs/api-contract.md)
