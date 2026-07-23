# Stock Service

`stock-service` provides the product catalog and returns nearby stores that have a selected product in stock. Store master data is owned by `store-service` and is fetched with one bulk request.

The implementation currently covers the project plan through Day 12, including
five-minute Redis caching and cache-consistent stock updates.

## Architecture

The code follows a layered, ports-and-adapters structure:

- `domain`: stock rules, domain models, and distance calculation
- `application`: use-case services, response models, and output ports
- `infrastructure`: Oracle persistence and the `store-service` RestClient adapter
- `presentation`: REST controllers and shared API error handling
- `config`: external client and domain service configuration

## API

```http
GET /products
GET /products/{productId}/stores?lat=41.02&lng=29.01&radius=10
PUT /products/{productId}/stores/{storeId}/stock
GET /actuator/health
```

The stock endpoint:

1. checks that the product exists;
2. reads available stock records from Oracle;
3. fetches store details with `GET /stores?ids=...`;
4. calculates Haversine distance;
5. filters by radius and sorts by distance;
6. exposes `stockLevel`, never raw quantity.

## Configuration

Local defaults are provided and can be overridden with environment variables:

| Variable | Default |
|---|---|
| `STOCK_DB_URL` | `jdbc:oracle:thin:@//localhost:1521/FREEPDB1` |
| `STOCK_DB_USERNAME` | Required |
| `STOCK_DB_PASSWORD` | Required |
| `STORE_SERVICE_BASE_URL` | `http://localhost:8081` |
| `STORE_SERVICE_CONNECT_TIMEOUT` | `2s` |
| `STORE_SERVICE_READ_TIMEOUT` | `3s` |
| `REDIS_HOST` | `localhost` |
| `REDIS_PORT` | `6379` |
| `REDIS_CONNECT_TIMEOUT` | `2s` |
| `REDIS_TIMEOUT` | `2s` |
| `FRONTEND_ALLOWED_ORIGIN` | `http://localhost:5173` |
| `SERVER_PORT` | `8080` |

Oracle schema and contract-aligned sample data are available in `src/main/resources/schema.sql` and `src/main/resources/data.sql`.

For a local PowerShell session, set the required credentials before starting the application:

```powershell
$env:STOCK_DB_USERNAME = "your_user"
$env:STOCK_DB_PASSWORD = "your_password"
```

## Redis Cache

`GET /products/{productId}/stores` results are cached in Redis for five minutes.
The cache key contains `productId`, `lat`, `lng`, and `radius`, so different
searches do not share results. Entries use the service-specific key prefix
`stock-service::product-stores::`.

`GET /products` is not cached. If Redis is temporarily unavailable, the stock
search logs the cache error and continues by reading from Oracle and
`store-service`.

A successful stock update evicts all `product-stores` entries after the
database update completes. A rejected update does not evict the cache. Clearing
the whole cache favors consistency; product-scoped eviction can be introduced
later if the cache grows significantly.

Start the shared Redis container from the repository root before running the
service:

```powershell
docker compose up -d redis
```

Useful checks:

```powershell
docker exec turkcell-redis redis-cli ping
docker exec turkcell-redis redis-cli --scan --pattern "stock-service::product-stores::*"
```

## Stock Update

Set the absolute quantity of an existing product/store stock record:

```http
PUT /products/1/stores/1/stock
Content-Type: application/json

{ "quantity": 4 }
```

The response is `204 No Content`. Quantity must be zero or greater. Read
endpoints continue to expose only `stockLevel`, never raw quantity.

The cumulative collection, local environment, and Day 12 invalidation scenario
are documented in:

```text
postman/README.md
```

## Run and Test

Java 17 or newer is required.

```powershell
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

Tests use an in-memory H2 database in Oracle compatibility mode and an in-memory
cache manager, so local Oracle and Redis instances are not required for the test
suite.

Swagger UI is available at `http://localhost:8080/swagger-ui/index.html` while the application is running.

For local frontend integration, CORS allows the Vite development origin
`http://localhost:5173` by default. Override `FRONTEND_ALLOWED_ORIGIN` when the
frontend is served from a different origin. CORS can be centralized at the API
Gateway when the gateway is introduced.
