# Gün 8 — Haversine ve Geo Sorgu

## Bugün ne yaptım

`GET /products/{id}/stores` endpoint'ine `lat`, `lng` ve `radius` query parametrelerini ekledim. Haversine algoritmasıyla kullanıcı ile bayi arasındaki kuş uçuşu mesafeyi hesapladım. Sonuçları yarıçapa göre filtreleyip mesafeye göre sıraladım.

## Ne anladım

Haversine algoritmasının iki enlem-boylam noktası arasındaki kuş uçuşu mesafeyi hesapladığını öğrendim. Algoritma enlem ve boylam farklarını radyana çeviriyor, iki nokta arasındaki açıyı buluyor ve bu açıyı Dünya'nın yarıçapıyla çarparak kilometre cinsinden mesafeyi hesaplıyor.

`@RequestParam` ile URL üzerinden `lat`, `lng` ve `radius` değerlerinin alınabildiğini öğrendim. Ayrıca `@DecimalMin`, `@DecimalMax` ve `@Positive` ile bu parametrelerin doğrulanabildiğini gördüm.

## Ne anlamadım / kafama takılanlar

- Gerçek projelerde mesafe hesabının uygulama içinde mi yoksa veritabanında mı yapılmasının daha doğru olduğunu tam olarak bilmiyorum.
    
- Kuş uçuşu mesafe ile gerçek yol mesafesi arasındaki farkın nasıl hesaplandığını merak ediyorum.
    
- Gün 9'da bayi koordinatlarının `store-service` üzerinden nasıl alınacağını tam olarak bilmiyorum.
    

## Yarın standup'ta sormak istediğim

Geo sorgular çok fazla veri olduğunda uygulama katmanında hesaplanırsa performans problemi oluşturur mu?