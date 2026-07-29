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
├── docker-compose.yml   (tüm sistem)
├── docker/oracle/init   (shared Oracle users)
├── api-gateway          (port 8085 — ortak API Gateway)
├── stock-service        (container port 8080 — Pasaj / Backend A)
├── store-service        (port 8081 — Bayi master data / Backend B)
├── capability-service   (port 8082 — İşlem yetkinliği / Backend B)
├── frontend
└── docs
```

## Tek Komutla Çalıştırma

Docker Desktop çalışırken proje kökünde:

```bash
docker compose up -d --build --wait
```

Container durumlarını görmek için:

```bash
docker compose ps
```

Sistemi durdurmak için:

```bash
docker compose down
```

- Frontend: http://localhost:8080
- API Gateway health: http://localhost:8085/actuator/health
- Stock service: http://localhost:8083
- Store service: http://localhost:8081
- Capability service: http://localhost:8082
- Oracle container: `turkcell-oracle`
- Oracle port/service: `1521` / `FREEPDB1`
- Store schema: `store_app` / `StoreApp123`
- Stock schema: `stock_app` / `StockApp123`
- Redis container/port: `turkcell-redis` / `6379`
- Oracle init: `docker/oracle/init/`, `store-service/sql/`, `stock-service/sql/`
- API contract: [`docs/api-contract.md`](docs/api-contract.md)

Compose; Oracle → Redis → Store → Stock/Capability → Gateway → Frontend
başlatma sırasını healthcheck ve `depends_on` koşullarıyla yönetir. Frontend
istekleri Nginx üzerinden Compose ağındaki API Gateway'e aktarılır.

`docker compose down` veritabanı verisini silmez. Oracle ve Redis volume'larını
da silmek isterseniz ayrıca `--volumes` gerekir; mevcut veriyi korumak için bu
seçeneği normal kullanımda eklemeyin.

## Local Development

Java 21 is required for all backend services. Every Maven module enforces this
version so an unsupported JDK fails at the start of the build.

On Windows, each `mvnw.cmd` automatically selects an IntelliJ-installed
`%USERPROFILE%\.jdks\corretto-21*` JDK before starting Maven. If Java 21 is
installed elsewhere, set `DEALER_MAP_JAVA_HOME` to that JDK directory.

## Backend B (store + capability)

```bash
# Terminal 1
cd store-service && mvnw.cmd spring-boot:run

# Terminal 2 (store-service ayaktayken)
cd capability-service && mvnw.cmd spring-boot:run
```

- Store Swagger: http://localhost:8081/swagger-ui.html
- Capability Swagger: http://localhost:8082/swagger-ui.html
