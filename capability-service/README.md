# capability-service

turkcell.com.tr **"Yakınımda İşlem"** modülünün backend servisi (Backend B).

## Amaç

"Bu işlemi hangi bayi yapabiliyor?" sorusunu cevaplar. Bayi detayını **kopyalamaz** — `store_id` tutar, detay için `store-service`'e RestClient ile gider.

## Port

`8082`

## Endpoint'ler (API Contract 3.6–3.7 + Gün 7 filtre)

| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/capabilities/types` | İşlem tipi dropdown |
| GET | `/capabilities/{type}/stores?lat=&lng=&radius=` | Yakın yetkin bayiler |
| GET | `/capabilities/{type}/stores?...&workingHours=weekend&status=ACTIVE` | Parametreli filtre (Gün 7) |

## Çalıştırma

Önkoşul: Oracle ve Redis ayakta + **store-service (8081)** ayakta.

```bash
# proje kökünden
docker compose up -d oracle redis

# store-service
cd store-service && mvnw.cmd spring-boot:run

# capability-service (ayrı terminal)
cd capability-service && mvnw.cmd spring-boot:run
```

Swagger: http://localhost:8082/swagger-ui.html

## Örnek istek

```http
GET http://localhost:8082/capabilities/DEVICE_REPAIR/stores?lat=41.02&lng=29.01&radius=10&status=ACTIVE&workingHours=weekend
```

## Gün 10-11: CORS ve Redis

- Frontend origin'leri: `http://localhost:5173`, `http://localhost:3000`
- Capability sorguları Redis'te **1 saat** tutulur.
- Key prefix: `capability-service::`
- Cache hit/miss bilgisi uygulama logunda TRACE seviyesinde görünür.

Redis kontrolü:

```bash
docker exec turkcell-redis redis-cli ping
docker exec turkcell-redis redis-cli --scan --pattern "capability-service::*"
```
