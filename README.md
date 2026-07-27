# Bayi Harita Entegrasyonu

## Proje Özeti

İki ayrı ürün, tek ortak altyapı mantığı:

- **Pasaj - "Yakınımda Stokta":** Kullanıcı bir ürünün hangi bayide stokta olduğunu harita üzerinde görür. (Backend Stajyer A)
- **turkcell.com.tr - "Yakınımda İşlem":** Kullanıcı yapmak istediği işlemi (yeni hat, cihaz teslim, numara taşıma vb.) seçer, o işlemi yapabilen en yakın bayiyi haritada görür. (Backend Stajyer B)
- **Frontend:** Her iki modülü de içeren tek bir React uygulaması. (Frontend Stajyer)
--- 
## Project Structure

```txt
dealer-map-integration
├── docker-compose.yml   (Oracle Free + Redis)
├── docker/oracle/init   (shared Oracle users)
├── api-gateway          (port 8085 — ortak API Gateway)
├── stock-service        (port 8080 — Pasaj / Backend A)
├── store-service        (port 8081 — Bayi master data / Backend B)
├── capability-service   (port 8082 — İşlem yetkinliği / Backend B)
├── frontend
└── docs
```

## Local Infrastructure

Java 21 is required for all backend services. Every Maven module enforces this
version so an unsupported JDK fails at the start of the build.

On Windows, each `mvnw.cmd` automatically selects an IntelliJ-installed
`%USERPROFILE%\.jdks\corretto-21*` JDK before starting Maven. If Java 21 is
installed elsewhere, set `DEALER_MAP_JAVA_HOME` to that JDK directory. This
project-specific setting takes precedence over the machine-wide Java `PATH`.

Verify the selected runtime from any backend module:

```powershell
.\mvnw.cmd -version
```

```bash
docker compose up -d oracle redis
docker compose ps
```

- Oracle container: `turkcell-oracle`
- Oracle port/service: `1521` / `FREEPDB1`
- Store schema: `store_app` / `StoreApp123`
- Stock schema: `stock_app` / `StockApp123`
- Redis container/port: `turkcell-redis` / `6379`
- Oracle init: `docker/oracle/init/`, `store-service/sql/`, `stock-service/sql/`
- API contract: [`docs/api-contract.md`](docs/api-contract.md)

Only `turkcell-oracle` should use host port `1521`. A legacy `oracle-db`
container is not part of Compose and must remain stopped after its data has
been migrated. Do not remove an Oracle container or the `oracle-data` volume
without a verified backup.

## Backend B (store + capability)

```bash
# Terminal 1
cd store-service && mvnw.cmd spring-boot:run

# Terminal 2 (store-service ayaktayken)
cd capability-service && mvnw.cmd spring-boot:run
```

- Store Swagger: http://localhost:8081/swagger-ui.html
- Capability Swagger: http://localhost:8082/swagger-ui.html
