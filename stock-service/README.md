# Stock Service

`stock-service` provides the product catalog and returns nearby stores that have a selected product in stock. Store master data is owned by `store-service` and is fetched with one bulk request.

The implementation covers the project plan through Day 15. It includes
five-minute Redis caching, cache-consistent stock updates, Gateway-based
cross-cutting concerns, graceful API errors, and repeatable Demo #3 checks.

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
| `STOCK_DB_USERNAME` | `stock_app` |
| `STOCK_DB_PASSWORD` | `StockApp123` |
| `STORE_SERVICE_BASE_URL` | `http://localhost:8081` |
| `STORE_SERVICE_CONNECT_TIMEOUT` | `2s` |
| `STORE_SERVICE_READ_TIMEOUT` | `3s` |
| `REDIS_HOST` | `localhost` |
| `REDIS_PORT` | `6379` |
| `REDIS_CONNECT_TIMEOUT` | `2s` |
| `REDIS_TIMEOUT` | `2s` |
| `FRONTEND_ALLOWED_ORIGIN` | `http://localhost:5173` |
| `SERVER_PORT` | `8080` |

Oracle schema and contract-aligned sample data are available in
`sql/schema.sql` and `sql/data.sql`. On a fresh `oracle-data` volume, Docker
Compose runs these scripts automatically for the shared `turkcell-oracle`
container.

The local defaults match Docker Compose. Override them only when needed:

```powershell
$env:STOCK_DB_USERNAME = "stock_app"
$env:STOCK_DB_PASSWORD = "StockApp123"
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

Start the shared Oracle and Redis containers from the repository root before
running the service:

```powershell
docker compose up -d oracle redis
docker compose ps
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

Java 21 is required. Maven Enforcer stops the build immediately with a clear
message if another JDK is selected.

```powershell
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

Tests use an in-memory H2 database in Oracle compatibility mode and an in-memory
cache manager, so local Oracle and Redis instances are not required for the test
suite.

Swagger UI is available at `http://localhost:8080/swagger-ui/index.html` while the application is running.

Frontend CORS is centralized in the API Gateway. Direct browser access to the
Stock Service is not part of the public application flow.

## Docker Image

The Day 16 image uses a multi-stage build. Maven and JDK 21 are available only
in the build stage; the final image contains the executable JAR and a Java 21
JRE. The application runs as the non-root `spring` user.

Build the image from the `stock-service` directory:

```powershell
docker build -t stock-service:day16 .
```

Start Oracle and Redis from the repository root:

```powershell
docker compose up -d oracle redis
docker compose ps
```

Run the Stock Service on the Compose network. This command expects
`store-service` to be available on the host at port `8081`:

```powershell
docker run --rm --name stock-service-day16 `
  --network dealer-map-integration_default `
  -p 8080:8080 `
  -e STOCK_DB_URL=jdbc:oracle:thin:@//oracle:1521/FREEPDB1 `
  -e STOCK_DB_USERNAME=stock_app `
  -e STOCK_DB_PASSWORD=StockApp123 `
  -e REDIS_HOST=redis `
  -e REDIS_PORT=6379 `
  -e STORE_SERVICE_BASE_URL=http://host.docker.internal:8081 `
  stock-service:day16
```

Verify the running container:

```powershell
curl.exe http://localhost:8080/actuator/health
curl.exe http://localhost:8080/products
docker image ls stock-service:day16
```

The first build downloads the base images and Maven dependencies. Subsequent
builds reuse Docker layers while `pom.xml` and the relevant source files remain
unchanged. `.dockerignore` keeps build output, IDE metadata, documentation, SQL,
and Postman artifacts out of the build context.

## API Gateway

Day 13 uses `api-gateway` as the public entry point on port `8085`. The
Stock Service remains on port `8080`; the Gateway removes the `/api/pasaj`
prefix and forwards the request internally:

```text
GET http://localhost:8085/api/pasaj/products
GET http://localhost:8085/api/pasaj/products/1/stores?lat=41.02&lng=29.01&radius=10
PUT http://localhost:8085/api/pasaj/products/1/stores/1/stock
```

Gateway verification is available in
`postman/stock-service-day13-gateway.postman_collection.json`.

## Day 14 Resilience

Day 14 verifies that failure responses remain useful through the Gateway:

- malformed JSON returns `400` with the shared `ApiError` body;
- unsupported request content types return `415` with the shared `ApiError`
  body;
- supplied and generated correlation IDs are present on error responses;
- the Redis rate limiter protects only the stock write route;
- product read requests remain available after a write burst is limited.

Run the repeatable Collection Runner scenario in
`postman/stock-service-day14-resilience.postman_collection.json`. The rate-limit
probe sends an invalid quantity, so it exercises the write route without
changing stock data.

## Day 15 Demo

Demo #3 uses the Day 13 collection for the successful stock/cache flow and the
Day 14 collection for resilience checks. Run both Maven suites with Java 21
before the live demo. The expected automated baseline is 35 Stock Service tests
and 11 API Gateway tests.
