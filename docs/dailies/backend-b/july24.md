# Gün 14 - Gateway request logging ve rate limiting

## Bugün ne yaptım
Backend A ile birlikte api-gateway üzerinde request logging filtresini ve Redis tabanlı rate limiting davranışını Backend B route larından doğruladım. Gateway her istekte X-Correlation-Id üretiyor veya istemciden gelen değeri koruyor; method, path, status ve süre loglanıyor. Rate limiter yalnızca stok yazma route unda (PUT /api/pasaj/products/*/stores/*/stock) aktif; /api/stores/** ve /api/comtr/** okuma route ları bu limitten etkilenmiyor. Day 14 Postman collection ını store-service/postman/backend-b-day14-gateway altına export ettim: Gateway health, stores listesi, store 404 ApiError, capability types, bilinmeyen tip 404 ve DEVICE_REPAIR geo araması. Lokal doğrulamada curl ile gateway üzerinden stores, 404 ApiError ve capability endpoint lerini kontrol ettim.

## Ne anladım
Rate limiting in gateway de olmasının nedeni tek giriş noktasında IP veya istemci bazlı koruma sağlamaktır; her mikroserviste ayrı kota tutmak yerine write route a özel limit okuma ağırlıklı B servislerinin kullanıcı deneyimini bozmaz. Correlation ID nin 404 cevaplarında da bulunması frontend de görülen hata ile gateway logunu eşleştirmeyi kolaylaştırır. PowerShell de JSON body gönderirken tırnak kaçışı bozulabiliyor; curl.exe --% ile gövde düzgün iletiliyor.

## Ne anlamadım / kafama takılanlar
- Capability CUD (PUT/DELETE) için gateway CORS a DELETE eklenmeli mi, yoksa admin işlemleri servis portundan mı kalmalı?
- Redis down olduğunda rate limiter fail-open mı fail-closed mı olmalı?

## Yarın standup'ta sormak istediğim
Demo 3 te B akışını (com.tr capability ve store cache) gateway üzerinden cold/warm süre farkıyla mı yoksa yalnızca happy-path ile mi göstereceğiz?
