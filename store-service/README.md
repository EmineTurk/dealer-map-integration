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

Örnek response:

```json
{
  "id": 1,
  "name": "Turkcell Kadikoy TIM",
  "address": "Sogutlucesme Cd. No: 42, Kadikoy",
  "city": "Istanbul",
  "district": "Kadikoy",
  "latitude": 40.9901,
  "longitude": 29.0253,
  "type": "TIM"
}
```

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

## Sonraki Adımlar (Gün 3+)

- Oracle + STORE tablosu (Gün 3–4)
- `GET /stores?ids=1,5,9` — toplu sorgu (diğer servisler için)
- `GET /stores?city=Istanbul&district=Kadikoy` — bölgesel filtreleme
