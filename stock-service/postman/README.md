# Stock Service Postman Dokümantasyonu

Bu klasör Stock Service'in güncel API contract'ını ve Day 1-12 boyunca
geliştirilen davranışları Postman üzerinden doğrulamak için kullanılır.

Geçmiş günler için aynı endpoint'leri tekrar eden ayrı collection dosyaları
oluşturmak yerine, güncel sözleşmeyi temsil eden tek bir ana collection
tutulur. Sıralı ve stateful bir senaryo olan Day 12 cache invalidation testi
ayrı collection olarak korunur.

## Dosyalar

| Dosya | Amaç |
|---|---|
| `stock-service.postman_collection.json` | Tüm güncel Stock Service endpoint ve hata senaryoları |
| `stock-service-local.postman_environment.json` | Local URL, ürün, bayi ve geo parametreleri |
| `stock-service-day12.postman_collection.json` | Stok güncelleme sonrası cache invalidation senaryosu |

API alanları, status kodları ve hata gövdeleri için ana kaynak
`../../docs/api-contract.md` dosyasıdır. Contract değişirse önce contract, sonra
kod ve bu collection'lar güncellenir.

## Ön Koşullar

1. Oracle ve Redis çalışıyor olmalı.
2. Store Service `http://localhost:8081` üzerinde çalışmalı.
3. Stock Service `http://localhost:8080` üzerinde çalışmalı.
4. `stock_app` şemasında `sql/schema.sql` ve `sql/data.sql` uygulanmış olmalı.

Servis kontrolleri:

```powershell
docker exec turkcell-redis redis-cli ping
Invoke-RestMethod http://localhost:8081/actuator/health
Invoke-RestMethod http://localhost:8080/actuator/health
```

## Postman'e Import

Postman'de **Import → Files** ile şu iki dosyayı import et:

1. `stock-service.postman_collection.json`
2. `stock-service-local.postman_environment.json`

Sağ üstteki environment menüsünden **Stock Service - Local** seç.

Day 12 cache invalidation testi için ayrıca
`stock-service-day12.postman_collection.json` dosyasını import et.

## Günlere Göre Kapsam

| Gün | Postman kanıtı |
|---|---|
| Day 1 | `GET /actuator/health` ile servisin ayakta olması |
| Day 2 | `GET /products` ve ürün DTO alanları |
| Day 3-4 | Ürünlerin in-memory yerine Oracle'dan gelmesi |
| Day 5 | `400/404` cevaplarının ortak `ApiError` formatı |
| Day 6 | DDD refactor sonrası dış API sözleşmesinin değişmemesi |
| Day 7 | `GET /products/{id}/stores` ve `stockLevel`; raw quantity yok |
| Day 8 | `lat/lng/radius`, mesafe filtresi ve sıralama |
| Day 9 | Sonuçlarda Store Service'ten gelen bayi detayları |
| Day 10 | Servisler birlikte çalışırken uçtan uca GET ve hata senaryoları |
| Day 11 | Aynı geo GET çağrısında Redis cache anahtarının oluşması |
| Day 12 | PUT ile stok güncelleme ve eski cache sonucunun silinmesi |

Day 3, 4, 6 ve 9 gibi iç mimari günleri yalnızca HTTP response'tan tamamen
kanıtlanamaz. Bu günlerde Postman sonucu; kod, SQL ve otomatik testlerle birlikte
değerlendirilir.

## Ana Collection'ı Çalıştırma

Collection menüsünden **Run collection** seç ve istekleri tanımlı sırayla bir
iteration çalıştır.

Beklenen temel sonuçlar:

- Health: `200` ve `UP`
- Product catalog: `200` ve array
- Product/store search: `200`, mesafeye göre sıralı, raw quantity yok
- Unknown product: `404` + `ApiError`
- Missing radius: `400` + `ApiError`
- Existing stock update: `204`
- Negative quantity: `400`
- Unknown stock record: `404`
- Son istek ürün 1 / bayi 1 miktarını seed değeri olan `10` değerine geri alır

## Day 11 Cache Kontrolü

`GET Nearby Stores With Stock` isteğini çalıştırdıktan sonra:

```powershell
docker exec turkcell-redis redis-cli --scan --pattern "stock-service::product-stores::*"
```

Bir anahtar görünmelidir. Aynı isteği tekrar çalıştırdığında
`CacheInterceptor` logunda cache hit görülmelidir.

## Day 12 Cache Invalidation Kontrolü

Day 12 collection'ını sırasıyla çalıştır:

1. Miktarı `10` yapar.
2. GET sonucunu `IN_STOCK` olarak cache'e alır.
3. Miktarı `4` yapar ve cache'i temizler.
4. Aynı GET'in `LOW` döndüğünü doğrular.

Üçüncü istekten hemen sonra Redis kontrolü:

```powershell
docker exec turkcell-redis redis-cli --scan --pattern "stock-service::product-stores::*"
```

Sonuç gelmemelidir. Dördüncü GET sonrasında anahtar yeniden oluşur.

Day 12 collection'ı miktarı `4` değerinde bırakır. Test sonunda seed değerine
dönmek için ana collection içindeki `PUT Restore Seed Quantity - 204` isteğini
çalıştır.
