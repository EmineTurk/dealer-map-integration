# Gün 14 — Graceful Hatalar, Request Logging ve Rate Limiting

## Bugün ne yaptım

Day 13'te kurulan API Gateway altyapısını hata ve yoğun istek senaryoları için
sertleştirdim. Gateway'deki global request filtresinin her cevapta
`X-Correlation-Id` üretmesini veya istemciden gelen değeri korumasını; method,
path, status code ve işlem süresini tek bir yapılandırılmış log satırında
yazmasını doğruladım.

Redis tabanlı rate limiter'ın yalnızca
`PUT /api/pasaj/products/{productId}/stores/{storeId}/stock` public route'una
uygulandığını kontrol ettim. Varsayılan limit saniyede 5 istek ve 10 istek burst
kapasitesi. Client anahtarı doğrudan bağlantı IP'sinden üretiliyor; Gateway
güvenilir bir reverse proxy arkasındaysa `TRUSTED_PROXY_COUNT` ile yalnızca
güvenilir `X-Forwarded-For` zinciri kullanılıyor. Okuma route'ları write
limitinden etkilenmiyor.

Stock Service'in bozuk JSON request body için genel `500` yerine ortak
`ApiError` formatında `400 Invalid request body`, desteklenmeyen content type
için ise `415 Unsupported media type` dönmesini ekledim. Bu cevapların status,
message ve timestamp alanlarını taşıdığını otomatik controller testleriyle
doğruladım.

Day 14 için ayrı ve tekrar çalıştırılabilir bir Postman Collection Runner
senaryosu hazırladım. Senaryo Gateway üzerinden `400`, `404` ve `415`
cevaplarının sözleşmesini, hata response'larındaki correlation ID'yi, write
burst sonunda `429 Too Many Requests` dönmesini ve rate limit sonrasında ürün
okuma route'unun `200` dönmeye devam etmesini kontrol ediyor. Rate-limit
isteklerinde negatif quantity kullandığım için test stok verisini değiştirmiyor.

Java 21 ile Stock Service'in 35, API Gateway'in 11 otomatik testinin tamamı
başarıyla çalıştı.

## Ne anladım

Rate limiting'in validation'dan önce Gateway'de uygulanmasının, geçersiz
isteklerin de servis kaynağı tüketmesini sınırladığını öğrendim. Limitin yalnızca
yazma route'unda olması ürün listeleme ve bayi arama gibi okuma akışlarının
gereksiz yere engellenmesini önlüyor.

Correlation ID yalnızca başarılı cevaplarda değil, `400`, `404`, `415`, `429`
ve downstream hata cevaplarında da bulunmalıdır. Böylece frontend'de görülen
bir hata ile Gateway logundaki ilgili istek aynı değer üzerinden eşleştirilebilir.

İstemciden gelen `X-Forwarded-For` değerine doğrudan güvenmenin rate limit'i
kolayca aşılabilir hale getirdiğini; bu header'ın yalnızca bilinen reverse proxy
sayısı yapılandırıldığında kullanılmasının daha güvenli olduğunu anladım.

## Ne anlamadım / kafama takılanlar

- Birden fazla Gateway instance'ı çalıştığında Redis rate limiter anahtarlarının
  tenant veya authenticated user ID ile nasıl ayrılması gerekir?
- `429` cevaplarında frontend'in güvenli retry zamanı seçebilmesi için
  `Retry-After` header'ı ayrıca üretilmeli mi?
- Correlation ID'yi Gateway'den Stock ve Store Service loglarındaki MDC alanına
  otomatik taşımak için Micrometer Tracing'e ne zaman geçmeliyiz?
- Redis erişilemez olduğunda write route için fail-open mı, fail-closed mu
  davranmak daha doğru olur?

## Yarın standup'ta sormak istediğim

Production rate limit politikasını IP yerine access token içindeki client veya
user ID ile uygulamadan önce hangi trafik metriklerini toplamamız gerekir?
