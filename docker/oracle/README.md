# Shared Oracle

The project uses one Oracle container:

- Container: `turkcell-oracle`
- Host port: `1521`
- Service: `FREEPDB1`
- Persistent volume: `dealer-map-integration_oracle-data`
- Store schema: `store_app` / `StoreApp123`
- Stock schema: `stock_app` / `StockApp123`

Start and verify it from the repository root:

```powershell
docker compose up -d oracle
docker compose ps
docker exec turkcell-oracle healthcheck.sh
```

The init scripts run only when `oracle-data` is initialized for the first
time. They create both application users, the Store/Capability tables, and the
Stock tables with sample data.

Only one Oracle container can bind host port `1521`. The legacy `oracle-db`
container is not part of Compose and should stay stopped after migration. Do
not remove that container or the named volume until a backup has been verified.
