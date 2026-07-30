# Gün 17-18 - Docker Compose (store/capability) + Unit Test

## Gün 17 — Compose: Backend B servisleri

### Bugün ne yaptım
Ortak docker-compose.yml içinde Backend B sorumluluğundaki store-service ve capability-service tanımlarını sertleştirdim. Alpine JRE image'larına wget ekledim; compose healthcheck'leri (/actuator/health + "status":"UP") container içinde güvenilir çalışsın diye Dockerfile'lara da aynı HEALTHCHECK'i yazdım. Her iki serviste actuator health probes açıldı. Compose tarafında store/capability için `start_period` 45s ve `retries` 18 yapıldı (Oracle soğuk açılış + JPA/Redis hazırlığı). capability-service için STORE_SERVICE_BASE_URL=http://store-service:8081 ve depends_on: store-service (healthy) sırası korundu — stock/gateway/frontend bloklarına dokunulmadı. docker compose config` ile YAML doğrulandı.

### Ne anladım
Compose ağında servis adı DNS kaydı gibidir; capability container'ından store'a localhost:8081 gitmez, store-service:8081 gider. depends_on yalnız start yetmez; condition: service_healthy ile actuator UP (DB+Redis) beklenmeli. Healthcheck komutu image'da yoksa (wget) container sonsuza yakın unhealthy kalır — bu yüzden runtime stage'de apk add wget şart. Backend B iki servisi: store önce ayağa kalkmalı, capability ve stock onu beklemeli; gateway hepsini bekler.

### Ne anlamadım / kafama takılanlar
- Actuator health Redis DOWN iken tüm servisi unhealthy saymak mı doğru, yoksa liveness/readiness ayrımı mı daha iyi?
- Image içi HEALTHCHECK ile compose healthcheck birlikte tanımlanınca hangisi öncelikli?

### Yarın standup'ta sormak istediğim

---

## Gün 18 — JUnit 5 + Mockito: filtreleme + geo

### Bugün ne yaptım
capability-service için anlamlı unit testler yazdım / genişlettim:

1. **CapabilityApplicationServiceTest** — persistence ve StoreServiceClient Mockito ile mock; mesafe hesabı gerçek DistanceCalculator. Senaryolar: HTTP'nin DB'den sonra ve ID yokken atlanması, bilinmeyen tipte 404, yarıçap dışı eleme, mesafeye göre artan sıralama, status=ACTIVE / case-insensitive status, workingHours=weekend, weekend+status birleşik filtre, boş status = filtresiz, null store status → ACTIVE kabul, capability types contract listesi, assign/remove.
2. **DistanceCalculatorTest** — aynı nokta = 0, 1 ondalık yuvarlama (İstanbul→Ankara 349.4), Kadıköy–Beşiktaş aralığı, simetri, parametreli radius gate.
3. **CapabilityTypeTest** — fromKey contract enum'ları, unknown/null/lowercase → null, label metinleri.

Odaklı test koşumu geçti; stock-service / frontend / gateway testlerine veya koduna dokunulmadı.

### Ne anladım
Unit test, domain/application kuralını dış bağımlılıksız doğrular: HTTP ve DB mock'lanır, Haversine gibi saf fonksiyon gerçek nesne kalır. Filtre zinciri (status → weekend → distance → radius → sort) controller'da değil application service'te olduğu için test de oraya yazılmalı. Mockito never() ile "yanlış tipte DB'ye hiç gidilmedi" gibi negatif senaryolar da kanıtlanır. Parametreli test radius eşiğini tablo gibi okunaklı tutuyor.

### Ne anlamadım / kafama takılanlar
- @Cacheable proxy yüzünden unit testte cache davranışını nasıl izole test ederiz (ayrı @SpringBootTest mi şart)?
- Store-service tarafında Day 18 için ek domain testi bekleniyor mu, yoksa geo/filtre yalnız capability'de mi?

### Yarın standup'ta sormak istediğim
