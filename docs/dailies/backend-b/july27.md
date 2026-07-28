# Gün 15 - Demo 3 gateway cache ve code review refactor

## Bugün ne yaptım
Week 3 Demo 3 için Backend B akışını gateway (localhost:8085) üzerinden toplayan Postman collection hazırladım (capability-service/postman/backend-b-day15-demo). Akış: gateway health, /api/stores bölgesel liste, capability geo cold istek, aynı URL ile warm istek (Redis TTL 1 saat; süre farkı loglanır), store status update ile CacheEvict. Day 14 resilience collection ile birlikte 404 ApiError, correlation ID ve read route ların write rate limit inden etkilenmediği demo checklist ine girdi. Ayrıca code review geri bildirimlerine göre refactor tamamlandı:

1. Hassas bilgiler env e taşındı: store-service ve capability-service application.yaml içinde DB URL, username, password ve Redis host/port ${STORE_DB_*} / ${CAPABILITY_DB_*} / ${REDIS_HOST} gibi ortam değişkenlerinden okunuyor; proje köküne .env.example eklendi.
2. Transaction içindeki HTTP dışarı alındı: capability-service te store-service RestClient çağrısı @Transactional kapsamından çıkarıldı; DB ID sorgusu CapabilityPersistenceService te kaldı, HTTP sonrası filtre/mesafe hesaplaması transaction dışında.
3. Controller routing temizlendi: StoreController içindeki ids/city/district if-else kaldırıldı; karar StoreApplicationService.getStores e taşındı, controller sadece parametreleri iletiyor.
4. static parseIds refactor: StoreApplicationService teki static parseIds kaldırıldı, ParseUtils utility sınıfına taşındı.
5. Redis cache key normalize: stores-by-ids için CacheKeys.sortedIds ile ID ler sıralanıp birleştiriliyor; [1,2] ile [2,1] aynı key.
6. Domain enum - DTO bağımlılığı koptu: StoreResponse type/status ve CapabilityTypeOption key alanları String; domain enum mapping from metodunda yapılıyor.
7. DRY stream zincirleri: tekrarlayan stream().map().collect() toStoreResponseList private helper a çekildi.
8. CacheEvict eklendi: store için PUT /stores/{id}/status, capability için PUT/DELETE /capabilities/{type}/stores/{storeId}; allEntries=true ile bayat cache engellendi. Lokal testte PUT status 200 döndü.
9. Test Redis bağımlılığı kesildi: application-test.yml ile spring.cache.type=none, Redis auto-config exclude, @ActiveProfiles(test).
10. Test kapsamı artırıldı: MockMvc/JUnit ile 404, 400, validation ve GlobalExceptionHandler senaryoları; store 21, capability 17 test geçti.

## Ne anladım
Capability verisi az değiştiği için TTL in 1 saat seçilmesi stoktaki 5 dk TTL den farklı bir trade-off tur. Cold/warm karşılaştırmasında URL nin (özellikle radius) benzersiz tutulması önceki koşulardan kalan cache hit inin ölçümü bozmasını engeller. Code review maddeleri mimari hijyeni somutlaştırıyor: transaction da HTTP connection pool u tıkar, controller da iş kuralı olmamalı, DTO domain e bağımlı olmamalı, CUD sonrası cache invalidate edilmezse stale data kalır.

## Ne anlamadım / kafama takılanlar
- CacheEvict allEntries=true yerine key bazlı invalidation ne zaman gerekir?
- Demo sonrası Newman ve CI için Oracle/Redis test verisini nasıl izole ederiz?

## Yarın standup'ta sormak istediğim
Gün 16 da store-service ve capability-service için multi-stage Dockerfile ları aynı anda mı, yoksa önce store sonra capability sırasıyla mı build edelim?
