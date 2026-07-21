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
| GET | `/stores/{id}` | Tek bayi |

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

## Gün 10-11: CORS ve Redis

- Frontend origin'leri: `http://localhost:5173`, `http://localhost:3000`
- Bayi sorguları Redis'te **1 saat** tutulur.
- Key prefix: `store-service::`
- Cache hit/miss bilgisi uygulama logunda TRACE seviyesinde görünür.

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
