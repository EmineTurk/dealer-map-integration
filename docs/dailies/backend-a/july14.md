# Gün 7 — Value Object ve Stok Seviyesi

## Bugün ne yaptım

Ürünün hangi bayilerde stokta olduğunu döndüren `GET /products/{id}/stores` endpoint'ini geliştirdim. STOCK tablosundaki `PRODUCT_ID` ve `STORE_ID` alanlarını composite key olarak modelledim. Stok miktarını doğrudan response'a vermek yerine `StockLevel` değerine çevirdim.

## Ne anladım

Value object, kendi kimliği olmayan ve bir değeri iş kurallarıyla temsil eden domain nesnesidir. `StockLevel`, stok miktarını `OUT_OF_STOCK`, `LOW` ve `IN_STOCK` durumlarına çevirdiği için value object mantığına uygundur.

Composite key kullanımında bir entity'nin kimliği birden fazla alandan oluşabilir. STOCK tablosunda aynı ürün ve aynı bayi için tek kayıt olması gerektiğinden `productId` ve `storeId` birlikte anahtar olarak kullanıldı.

Mapper sınıfı, persistence katmanındaki `StockEntity` ile domain katmanındaki `Stock` nesnesi arasında dönüşüm yapar.

## Ne anlamadım / kafama takılanlar

- Composite key yerine tek bir yapay ID kullanmanın hangi durumlarda daha doğru olduğunu tam olarak anlamadım.
- Mapper sınıflarının hangi durumlarda ayrı bir katmanda tutulması gerektiğini daha iyi öğrenmek istiyorum.

## Yarın standup'ta sormak istediğim

Composite key kullanımının performans ve bakım açısından avantajları ve dezavantajları nelerdir?