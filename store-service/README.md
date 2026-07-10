# Store Service

Bu servis, sistemin **bayi master data** kaynağıdır (single source of truth).

## Amaç

"Bayi kimdir, nerededir?" sorusunun cevabını tutar. Stok veya işlem yetkinliği bilmez — sadece bayinin kendisini bilir. `stock-service` ve `capability-service` bayi detayı için bu servise başvurur.

## Kullanılan Teknolojiler

- Java 17
- Spring Boot 3.x
- Maven
- Spring Web
- Spring Data JPA
- Oracle Driver
- Spring Data Redis
- Spring Boot Actuator
- Lombok
- Validation

---

## Gün 1 Durumu

- Spring Boot proje iskeleti oluşturuldu.
- Proje IntelliJ IDEA üzerinde açılabilir.
- Uygulama localde çalıştırılabilir (port: **8081**).
- Actuator health endpoint test edilebilir.

---

## Gün 2 Durumu

- `GET /stores` — in-memory bayi listesi (15 İstanbul bayisi)
- `GET /stores/{id}` — tek bayi detayı
- `StoreResponse` record, `StoreType` enum, in-memory repository
- Postman collection: `postman/store-service.postman_collection.json`

### Endpointler

```http
GET http://localhost:8081/stores
GET http://localhost:8081/stores/1
```

Example response (API contract `Store`):

```json
{
  "id": 1,
  "name": "Turkcell Kadikoy TIM",
  "address": "Sogutlucesme Cd. No: 42, Kadikoy",
  "city": "Istanbul",
  "district": "Kadikoy",
  "latitude": 40.9901,
  "longitude": 29.0253,
  "type": "TIM",
  "phone": "+90 216 555 0101",
  "workingHours": "09:00 - 21:00"
}
```

404 body (`ApiError`):

```json
{ "status": 404, "message": "Store not found: id=999", "timestamp": "2026-07-10T08:00:00Z" }
```

Contract: [`docs/api-contract.md`](../docs/api-contract.md)

---

## Çalıştırma

```bash
./mvnw spring-boot:run
```

Windows:

```bash
mvnw.cmd spring-boot:run
```

---

## Health Check

```http
GET http://localhost:8081/actuator/health
```

Beklenen cevap:

```json
{"status": "UP"}
```

---

## Gün 3 Durumu

- Oracle Free (`gvenzl/oracle-free:23-slim`) Docker Compose ile ayağa kaldırılır.
- `STORE` tablosu `store_app` şemasında SQL ile oluşturulur.
- Script ve bağlantı bilgileri: `sql/` klasörü.

### Oracle'ı başlatma

Proje kökünden (`dealer-map-integration/`):

```bash
docker compose up -d oracle
docker compose logs -f oracle
```

İlk açılış birkaç dakika sürebilir. Healthy olduktan sonra DBeaver:

| Alan | Değer |
|------|--------|
| Host | `localhost` |
| Port | `1521` |
| Service | `FREEPDB1` |
| User | `store_app` |
| Password | `StoreApp123` |

Tablo kontrolü:

```sql
SELECT table_name FROM user_tables WHERE table_name = 'STORE';
DESC store;
```

> Not: Endpoint'ler hâlâ in-memory. Spring Data JPA bağlantısı **Gün 4**.

---

## Sonraki Adımlar (Gün 4+)

- Store entity + repository + `application.yml` Oracle bağlantısı
- Seed data (15–20 İstanbul bayisi)
- `GET /stores?ids=1,5,9` — toplu sorgu (diğer servisler için)
- `GET /stores?city=Istanbul&district=Kadikoy` — bölgesel filtreleme
