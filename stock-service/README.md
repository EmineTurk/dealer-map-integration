# Stock Service

Bu servis, Pasaj tarafındaki "Yakınımda Stokta" özelliği için geliştirilmiştir.

## Amaç

Kullanıcının seçtiği ürünün hangi bayilerde stokta olduğunu bulmak ve bu bayileri kullanıcı konumuna göre listelemek.

---

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
- Proje IntelliJ IDEA üzerinde açıldı.
- Uygulama localde çalıştırıldı.
- Actuator health endpoint test edildi.

---
## Health Check

Uygulama çalıştıktan sonra aşağıdaki endpoint ile servis durumu kontrol edilebilir:

```http
GET http://localhost:8080/actuator/health
```

Beklenen cevap:

```json
{"status": "UP"}
```
---
