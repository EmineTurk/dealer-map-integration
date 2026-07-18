# Gün 6 — DDD Katmanları

## Bugün ne yaptım

Stock service projesini DDD katmanlarına göre yeniden düzenledim. Mevcut dosyaları application, domain, infrastructure ve presentation katmanlarına taşıdım. Ayrıca Stock domain modeli, StockLevel enum'u, StockMapper, StockService ve StockResponse yapılarını oluşturdum.

## Ne anladım

DDD yapısında her katmanın farklı bir sorumluluğu olduğunu anladım.

- Domain katmanı iş kurallarını içerir.
- Application katmanı uygulama akışını yönetir.
- Infrastructure katmanı veritabanı ve dış sistemlerle iletişim kurar.
- Presentation katmanı HTTP isteklerini karşılar.

StockEntity'nin veritabanını temsil ettiğini, Stock sınıfının ise iş kurallarını taşıyan domain modeli olduğunu öğrendim. Bu iki yapı arasında dönüşüm yapmak için mapper kullanıldığını anladım.

StockLevel sayesinde stok miktarını doğrudan dışarı vermek yerine domain kuralıyla anlamlı bir duruma çevirdim:

- 0 → OUT_OF_STOCK
- 1–5 → LOW
- 6 ve üzeri → IN_STOCK

## Ne anlamadım / kafama takılanlar

- Domain modeli ile JPA entity her projede mutlaka ayrı mı tutulmalıdır?
- Mapper sınıfları büyüdüğünde manuel yazmak yerine hangi yöntemler kullanılabilir?
- Repository interface'leri infrastructure katmanında mı, domain katmanında mı bulunmalıdır?

## Yarın standup'ta sormak istediğim

StockLevel neden enum olarak tasarlandı ve ne zaman value object için ayrı bir class kullanmak daha doğru olur?