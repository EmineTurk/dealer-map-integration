# Gün 12 — Stok Güncelleme ve Cache Invalidation

## Bugün ne yaptım

Day 12 kapsamına başlamadan önce API contract'a stok güncelleme sözleşmesini
ekledim. `PUT /products/{productId}/stores/{storeId}/stock` endpoint'i mevcut
bir ürün-bayi stok kaydının mutlak miktarını güncelliyor. Request body yalnızca
`quantity` alanını alıyor; başarılı cevap `204 No Content`. Ham miktar okuma
endpoint'lerinde dışarı verilmiyor.

DDD katmanlarına uygun olarak application katmanına `StockCommandPort` ve
`StockUpdateService`, infrastructure katmanına Oracle update adaptörü ekledim.
Repository'deki JPQL update sorgusu etkilenen satır sayısını dönüyor. Ürün
bulunamazsa `ProductNotFoundException`, ürün var fakat stok kaydı yoksa
`StockNotFoundException` ile ortak `ApiError` formatında `404` dönüyor.
Eksik veya negatif quantity değeri validation ile `400` dönüyor.

Stok güncellemesi başarıyla tamamlandıktan sonra
`@CacheEvict(cacheNames = "product-stores", allEntries = true)` ile bütün
ürün-bayi arama cache'ini temizledim. `beforeInvocation` kullanmadığım için
ürün veya stok bulunamadığında exception oluşuyor ve mevcut cache korunuyor.
Cache temizliği persistence işlemi başarıyla tamamlandıktan sonra gerçekleşiyor.

Cache invalidation davranışını Spring proxy ve in-memory `CacheManager` ile
test ettim. Aynı sorguyu cache'e aldıktan sonra başarılı stok güncellemesi
yapıldığında sonraki GET'in veri kaynaklarını yeniden çağırdığını; başarısız
güncellemede ise sonraki GET'in cache'ten dönmeye devam ettiğini doğruladım.
Controller contract, validation, `204`, `400`, `404`, persistence adapter ve
mevcut özelliklerle birlikte Java 21 üzerinde toplam 33 testin tamamı başarılı
oldu.

Postman için tekrarlanabilir bir senaryo hazırladım: önce miktarı 10 yapıp
sonucu `IN_STOCK` olarak cache'e alıyor, ardından miktarı 4'e güncelliyor ve
aynı GET isteğinin eski cache yerine `LOW` döndürdüğünü doğruluyor.

## Ne anladım

Cache invalidation'ın zor olmasının nedeni aynı verinin birden fazla cache
anahtarı altında bulunabilmesidir. Bu projede tek ürün; farklı latitude,
longitude ve radius değerleriyle çok sayıda anahtar üretebilir. Yalnızca tek
anahtarı silmek diğer aramalarda eski stok seviyesinin kalmasına neden olur.

`@CacheEvict(allEntries = true)` en hassas çözüm değildir fakat bütün koordinat
ve radius kombinasyonlarını temizlediği için tutarlılığı garanti eden basit bir
MVP tercihidir. Dezavantajı, tek ürün güncellendiğinde diğer ürünlerin cache
kayıtlarının da silinmesidir.

Başarısız bir veritabanı güncellemesinden önce cache'i silmenin gereksiz cache
miss üreteceğini öğrendim. Varsayılan `@CacheEvict` davranışında eviction metod
başarıyla döndükten sonra çalıştığı için hata alan komutlar mevcut cache'i
bozmuyor.

PUT isteğinin aynı miktarı tekrar gönderdiğimde aynı sonucu üretmesi nedeniyle
idempotent olduğunu ve command input'unda ham miktar kabul etmenin, bu miktarı
read response'unda dışarı vermekle aynı şey olmadığını anladım.

## Ne anlamadım / kafama takılanlar

- Cache büyüdüğünde yalnızca güncellenen productId'ye ait farklı geo
  anahtarlarını Redis'te verimli biçimde nasıl temizleyebiliriz?
- Aynı stok kaydı eş zamanlı güncellenirse lost update problemini optimistic
  locking ile çözmek gerekir mi?
- Veritabanı commit'i başarılı olup Redis eviction başarısız olursa bu
  tutarsızlığı event/outbox yaklaşımıyla nasıl gideririz?

## Yarın standup'ta sormak istediğim

API Gateway'e geçerken stok güncelleme endpoint'ini de
`/api/pasaj/products/{productId}/stores/{storeId}/stock` route'u altında açıp
request logging ve rate limiting kurallarına dahil edecek miyiz?
