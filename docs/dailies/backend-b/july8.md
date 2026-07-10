# Gün 1 — Spring Boot, mikroservis mimarisi ve proje iskeleti

## Bugün ne yaptım
API Contract üzerinde ekiple el sıkıştık. store-service Spring Boot iskeletini oluşturdum, port 8081'de ayağa kaldırdım ve actuator health endpoint'ini test ettim. Repo yapısını ve branch/PR akışını kurmaya başladık.

## Ne anladım
Bu projede tek monolit yerine üç ayrı servis var: store-service (bayi master data), stock-service (Pasaj stok), capability-service (işlem yetkinliği). Frontend hepsine (ileride Gateway üzerinden) konuşacak. Bayi bilgisi tek yerde (store-service) tutuluyor; diğer servisler sadece store_id tutup detayı oradan istiyor — veriyi çoğaltmama prensibi.

Önerilen paket/dizin yapısı:

```text
store-service/
├── controller/     → HTTP endpoint'ler (presentation)
├── service/        → iş kuralları (application)
├── repository/     → veri erişimi (infrastructure)
├── dto/            → API request/response modelleri
└── domain/         → enum, entity, value object
```

Spring Boot'un dependency injection ile sınıfları birbirine bağlaması sayesinde controller doğrudan repository'ye bağlanmak zorunda kalmıyor; katmanlar ayrılıyor.

## Ne anlamadım / kafama takılanlar
- Gateway henüz yokken servisler birbirini nasıl bulacak? (localhost + port mu, yoksa başka bir yol mu?)
- store-service ile capability-service aynı kişiye ait; ikisini ne zaman ayırmalıyız?

## Yarın standup'ta sormak istediğim
Yarın kod yazmaya başlarken klasör yapımızı hangi standarda göre oluşturmalıyız?
