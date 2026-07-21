# Gün 10 - Servis entegrasyonu ve CORS

## Bugün ne yaptım
Oracle, store-service ve capability-service'i birlikte çalıştırıp uçtan uca işlem arama senaryosunu test ettim. capability-service'in yetkin bayi ID'lerini veritabanından alıp store-service'in `GET /stores?ids=...` endpoint'inden bayi detaylarını çektiğini doğruladım. Frontend'in 5173 ve 3000 portlarından her iki Backend B servisine erişebilmesi için merkezi CORS konfigürasyonu ekledim; preflight `OPTIONS` isteklerini de test ettim.

## Ne anladım
CORS, backend'in bozuk olduğu anlamına gelmez; tarayıcının farklı origin'ler arasındaki isteklere uyguladığı güvenlik kuralıdır. Postman ve servisler arası RestClient çağrıları CORS'a tabi değildir, fakat tarayıcıdaki frontend çağrısı tabidir. Entegrasyon testinde tek endpoint'in çalışması yetmez; Oracle → capability-service → store-service zincirinin tamamının ayakta olması gerekir.

## Ne anlamadım / kafama takılanlar
- Gateway geldiğinde servis seviyesindeki CORS ayarları kaldırılmalı mı, yoksa savunma katmanı olarak kalmalı mı?
- Frontend farklı bir port veya domain'de yayınlandığında allowed-origins değerini environment variable ile nasıl yöneteceğiz?

## Yarın standup'ta sormak istediğim
Redis cache'i hangi sorgulara uygulamalıyız ve bayi/yetkinlik verisi için 1 saat TTL kararını nasıl doğrulayabiliriz?
