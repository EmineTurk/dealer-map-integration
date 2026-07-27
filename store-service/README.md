# Store Service

Bu servis, sistemin **bayi master data** kaynağıdır (single source of truth).

## Amaç

"Bayi kimdir, nerededir?" sorusunun cevabını tutar. Stok veya işlem yetkinliği bilmez — sadece bayinin kendisini bilir. `stock-service` ve `capability-service` bayi detayı için bu servise başvurur.

## Port

`8081`

## Endpoint'ler

| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/stores` | Tüm bayiler |
| GET | `/stores?ids=1,5,9` | Toplu ID (Diğer servisler — Gün 9) |
| GET | `/stores?city=Istanbul&district=Kadikoy` | Bölgesel filtre |
| GET | `/stores/{id}` | Tek bayi (+ `directionsUrl` — Gün 12) |

Swagger: http://localhost:8081/swagger-ui.html

## Çalıştırma

```bash
# proje kökünden Oracle + Redis
docker compose up -d oracle redis

cd store-service
mvnw.cmd spring-boot:run
```

Bağlantı: `store_app` / `StoreApp123` @ `FREEPDB1` (port 1521)

İlk açılışta `StoreDataLoader` tablo boşsa 15 İstanbul bayisini seed eder.

Yerel varsayılanlar tek `turkcell-oracle` container'ına bağlanır:

| Değişken | Varsayılan |
|---|---|
| `STORE_DB_URL` | `jdbc:oracle:thin:@//localhost:1521/FREEPDB1` |
| `STORE_DB_USERNAME` | `store_app` |
| `STORE_DB_PASSWORD` | `StoreApp123` |

Eski `oracle-db` aynı anda başlatılmamalıdır; iki container da host port
`1521`i kullanamaz.

## Gün 10-13: CORS → Gateway, Redis

- **Gün 11:** Bayi sorguları Redis'te **1 saat** tutulur (`store-service::` prefix).
- **Gün 12:** Response'a `directionsUrl` (Google Maps yol tarifi deep link) eklendi.
- **Gün 13:** CORS `api-gateway` (port **8085**) üzerinden yönetilir; bu serviste CORS config yok.
  Gateway yolu: `GET http://localhost:8085/api/stores/{id}`

```bash
docker exec turkcell-redis redis-cli ping
docker exec turkcell-redis redis-cli --scan --pattern "store-service::*"
```

## DDD paket yapısı (Gün 6)

```text
domain/          → Store aggregate, enums, exceptions
application/     → use-case servisleri + DTO
infrastructure/  → JPA entity, repository, seed
presentation/    → controller + exception handler
```
