# Stock Service

`stock-service` provides the product catalog and returns nearby stores that have a selected product in stock. Store master data is owned by `store-service` and is fetched with one bulk request.

The implementation currently covers the project plan through Day 9. Redis caching is intentionally deferred to Day 11.

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
| `FRONTEND_ALLOWED_ORIGIN` | `http://localhost:5173` |
| `SERVER_PORT` | `8080` |

Oracle schema and contract-aligned sample data are available in `src/main/resources/schema.sql` and `src/main/resources/data.sql`.

For a local PowerShell session, set the required credentials before starting the application:

```powershell
$env:STOCK_DB_USERNAME = "your_user"
$env:STOCK_DB_PASSWORD = "your_password"
```

## Run and Test

Java 17 or newer is required.

```powershell
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

Tests use an in-memory H2 database in Oracle compatibility mode, so a local Oracle instance is not required for the test suite.

Swagger UI is available at `http://localhost:8080/swagger-ui/index.html` while the application is running.

For local frontend integration, CORS allows the Vite development origin
`http://localhost:5173` by default. Override `FRONTEND_ALLOWED_ORIGIN` when the
frontend is served from a different origin. CORS can be centralized at the API
Gateway when the gateway is introduced.
