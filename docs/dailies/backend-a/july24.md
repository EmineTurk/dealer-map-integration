# Gün 15 — Demo #3 ve Week 3 Retrospective

## Bugün ne yaptım

Week 3 hedeflerini Demo #3 için tek bir doğrulama akışında topladım. Başarılı
senaryoda frontend'in kullandığı `http://localhost:8085` API Gateway girişinden
ürün kataloğu, geo parametreli yakın bayi stok sorgusu ve stok güncelleme
route'larını kontrol edecek Day 13 collection'ını demo sırasına yerleştirdim. Bu
akış correlation ID aktarımını, mesafeye göre sıralamayı, raw quantity yerine
`stockLevel` dönülmesini, stok güncellemesinden sonra Redis cache invalidation'ı
ve test verisinin seed miktarına geri alınmasını kapsıyor.

Hata ve yoğun trafik senaryoları için Day 14 collection'ını demo kontrol listesine
ekledim. Böylece ortak `ApiError` cevapları, correlation ID, `429 Too Many
Requests` ve write limitinden etkilenmeyen read route aynı demo içinde
tekrarlanabilir hale geldi.

Canlı entegrasyondan bağımsız güvence için testleri proje ile uyumlu Corretto
Java 21 üzerinde çalıştırdım. Stock Service'te 35, API Gateway'de 11 test geçti.
Makinenin varsayılan Java 26 sürümünde eski Mockito/ByteBuddy test stack'inin
inline mock oluşturamadığını gördüğüm için README ve demo notlarında Java 21
gereksinimini açık tuttum.

Day 15 için yeni iş kuralı veya public endpoint eklemedim. Günün odağını mevcut
API contract'ın bozulmadığını kanıtlamak, demo adımlarını tekrar çalıştırılabilir
hale getirmek ve Week 3 teknik kararlarını değerlendirmek olarak tuttum.

## Ne anladım

Demo hazırlığının yalnızca happy path'i göstermek olmadığını öğrendim. Başarılı
stok sorgusunun yanında downstream hata sözleşmesi, rate limit ve cache
tutarlılığı da gösterildiğinde sistem davranışı daha güvenilir biçimde
anlatılabiliyor.

Client tarafındaki TanStack Query cache ile backend Redis cache farklı
sorumluluklara sahip. TanStack Query tekrar render ve kullanıcı deneyimini
hızlandırırken Redis, Stock Service'in Oracle ve Store Service çağrılarını
azaltıyor. Stok güncellemesi backend cache'ini temizliyor; frontend tarafındaki
query invalidation ise ayrıca yönetilmelidir.

Otomatik test ile canlı entegrasyon testi birbirinin yerine geçmiyor. Unit ve
slice testler iş kurallarını hızlı doğrularken Postman akışı Gateway, Redis,
Oracle ve servisler arası bağlantının birlikte çalıştığını kanıtlıyor.

## Ne anlamadım / kafama takılanlar

- Demo sonrasında Postman collection'larını CI içinde Newman ile otomatik
  çalıştırmak için Oracle ve Redis test verisini nasıl izole etmeliyiz?
- Gateway, Stock Service ve Store Service loglarını tek ekranda aramak için ilk
  adım olarak OpenTelemetry mi yoksa merkezi log toplama mı kurulmalı?
- Cache invalidation ve stok update akışında production gözlemlenebilirliği için
  hangi metrikler alarm üretmeli?
- Java ve Spring sürümlerini bütün mikroservislerde tek BOM veya parent proje ile
  sabitlemek bakım maliyetini azaltır mı?

## Yarın standup'ta sormak istediğim

Week 4'e başlarken önceliği containerization/CI pipeline'a mı, yoksa Micrometer
metrics ve distributed tracing gibi observability çalışmalarına mı vermeliyiz?
