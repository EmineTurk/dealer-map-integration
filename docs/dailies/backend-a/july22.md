# Gün 13 — API Gateway ve Cross-Cutting Concerns

## Bugün ne yaptım

Mikroservislerin önünde tek giriş noktası olacak ortak `api-gateway` uygulamasına
Backend A özelliklerini ekledim. Gateway'i `8085` portunda çalışacak şekilde
yapılandırdım; mevcut
servis portlarını değiştirmedim:

- Stock Service: `8080`
- Store Service: `8081`
- Capability Service: `8082`
- API Gateway: `8085`

Spring Cloud Gateway üzerinde `/api/pasaj/**` route'unu tanımladım. Gateway,
bu prefix ile gelen istekleri Stock Service'e yönlendirirken `StripPrefix=2`
filtresiyle `/api/pasaj` bölümünü kaldırıyor. Örneğin dışarıdan gelen
`GET /api/pasaj/products` isteği Stock Service'e `GET /products` olarak
iletiliyor. Query parametreleri ve request body değiştirilmeden aktarılıyor.

Frontend'in `http://localhost:5173` origin'inden Gateway'e erişebilmesi için
CORS ayarını Gateway üzerinde tanımladım. `GET`, `PUT` ve `OPTIONS` metotlarına
izin verdim.

Ortak request logging için bir `GlobalFilter` ekledim. Filtre gelen
`X-Correlation-Id` header'ını devam ettiriyor; header yoksa yeni bir UUID
üretiyor. Correlation ID hem Stock Service'e iletiliyor hem de response
header'ında istemciye dönüyor. Her istek için method, path, status code,
correlation ID ve işlem süresi loglanıyor.

Gateway'in Stock Service bağlantısı için connect ve response timeout değerlerini
environment variable ile değiştirilebilir hale getirdim. Actuator health ve
info endpoint'lerini açtım. Gateway route yönetim endpoint'ini dışarı açmadım.

Stok güncelleme endpoint'ine Redis tabanlı rate limiting ekledim. Limit yalnızca
`PUT /api/pasaj/products/{productId}/stores/{storeId}/stock` route'una
uygulanıyor ve istemci IP'sini anahtar olarak kullanıyor. Varsayılan politika
saniyede 5 istek ve kısa süreli 10 istek burst kapasitesi olacak şekilde
environment variable ile değiştirilebilir tanımlandı. Okuma endpoint'leri bu
limitten etkilenmiyor.

Route prefix dönüşümü, query parametrelerinin korunması, CORS preflight,
correlation ID üretimi ve mevcut correlation ID'nin aktarılması için otomatik
testler yazdım. Rate limiter filtresinin yalnızca stok yazma route'unda olduğunu
ve Gateway Actuator yönetim endpoint'inin dışarı açılmadığını da doğruladım.
Toplam 11 Gateway testi başarıyla tamamlandı.

Canlı entegrasyon kontrolünde Gateway health endpoint'inden `UP` cevabı aldım.
Ürün kataloğunu ve yakın bayi stoklarını `8085` portundaki `/api/pasaj`
prefix'i üzerinden sorguladım. Sonuçların radius içinde filtrelendiğini,
mesafeye göre sıralandığını ve `stockLevel` alanıyla döndüğünü doğruladım.
Store Service kapalıyken ortak `503 Store service is unavailable` cevabını,
servis açıldıktan sonra ise başarılı bayi listesini gözlemledim. Stok
güncelleme isteğini de Gateway üzerinden göndererek `204 No Content` aldım.

Day 13 akışını tekrar çalıştırabilmek için ayrı bir Postman collection ekledim.
Collection; Gateway health, ürün route'u, correlation ID, geo stok sorgusu,
Gateway üzerinden stok güncelleme, cache invalidation ve test sonunda seed
miktarına geri dönüş adımlarını içeriyor.

## Ne anladım

API Gateway'in iş kurallarını taşıyan yeni bir domain servisi olmadığını
öğrendim. Gateway'in görevi dış istemciler için tek giriş noktası oluşturmak,
URL'leri doğru servislere yönlendirmek ve CORS, logging, correlation ID ve
timeout gibi ortak teknik ihtiyaçları merkezi olarak uygulamaktır.

Birden fazla servisi aynı biçimde ilgilendiren logging, güvenlik, CORS, tracing
ve rate limiting gibi ihtiyaçlara cross-cutting concern denildiğini anladım.
Bu ihtiyaçların bir bölümü Gateway'de merkezi yönetilse bile servislerin kendi
iş akışlarını ve servisler arası çağrılarını ayrıca gözlemlemesi gerekir.

Gateway'in dış URL'si ile mikroservisin iç URL'sinin aynı olmak zorunda
olmadığını gördüm. Public prefix Gateway'e aittir; Stock Service kendi
`/products` endpoint'lerini ve `8080` portunu değiştirmeden kullanmaya devam
eder.

## Ne anlamadım / kafama takılanlar

- Gateway tek hata noktası haline geldiğinde yüksek erişilebilirlik nasıl
  sağlanır?
- Correlation ID'nin bütün servislerin loglarında otomatik görünmesi için MDC
  ve distributed tracing nasıl birlikte kullanılmalıdır?
- Production ortamında IP tabanlı rate limiting yerine access token içindeki
  client ID veya kullanıcı ID'sine ne zaman geçilmelidir?
- Gateway timeout'u ile Stock Service'in Store Service timeout'u arasında nasıl
  bir süre sıralaması kurulmalıdır?

## Yarın standup'ta sormak istediğim

Gateway merkezi hata cevabını üretirken mikroservisten gelen mevcut `ApiError`
body'sini değiştirmeden nasıl korumalıdır?
