# Gün 1 - Spring Boot, mikroservis mimarisi ve proje iskeleti
 
## Bugün ne yaptım
Bugün ekip olarak API Contract üzerinde anlaştık. store-service için Spring Boot iskeletini oluşturdum ve servisi port 8081'de ayağa kaldırdım. Ardından actuator health endpoint'ini test ederek servisin doğru çalıştığını doğruladım. Ayrıca repo yapısını ve branch/PR akışını kurmaya başladık.
 
## Ne anladım
Bu projede tek bir monolit yapı yerine üç ayrı servis kullanılıyor: store-service, stock-service ve capability-service. store-service bayi master datasını tutuyor, stock-service Pasaj stok bilgisini yönetiyor, capability-service ise işlem yetkinliklerini yönetiyor. Frontend ileride Gateway üzerinden bu üç servisin tamamına istek atacak.
 
Bayi bilgisi yalnızca store-service içinde tutuluyor. Diğer servisler ise sadece storeId bilgisini tutup bayi detayını store-service'ten istiyor. Bu yaklaşım veriyi çoğaltmama prensibine dayanıyor.
 
Projenin kök dizin yapısı şu şekilde planlandı:
 
```text
bayi-harita-entegrasyonu/
├── store-service/
├── stock-service/
├── capability-service/
├── frontend/
├── docker-compose.yml
├── docs/
│   └── ogrenme-gunlugu/
└── README.md
```
 
store-service içindeki önerilen paket yapısı ise şu şekilde:
 
```text
store-service/
├── controller/     → HTTP endpoint'ler, presentation
├── service/        → iş kuralları, application
├── repository/     → veri erişimi, infrastructure
├── dto/            → API request/response modelleri
└── domain/         → enum, entity, value object
```
 
Spring Boot'un dependency injection mekanizması sayesinde sınıflar birbirine otomatik olarak bağlanıyor. Bu sayede controller, repository'ye doğrudan bağlanmak zorunda kalmıyor ve katmanlar birbirinden ayrılmış oluyor.
 
## Ne anlamadım / kafama takılanlar
Gateway henüz yokken servisler birbirini nasıl bulacak? Localhost ve port üzerinden mi iletişim kuracaklar, yoksa farklı bir yöntem mi kullanılacak?
 
store-service ile capability-service aynı kişiye ait. Bu iki servisi ne zaman ayrı servislere bölmeliyiz?
 
## Yarın standup'ta sormak istediğim
Yarın kod yazmaya başlarken klasör yapımızı hangi standarda göre oluşturmalıyız?
