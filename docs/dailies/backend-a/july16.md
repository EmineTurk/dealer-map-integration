# Gün 9 — Servisler Arası İletişim

## Bugün ne yaptım
stock-service içinden store-service'e RestClient ile HTTP isteği attım. Bayi detaylarını stok ve mesafe bilgileriyle birleştirdim. Store-service kapalı olduğunda 503 hata yönetimi ve timeout ekledim.

## Ne anladım
Mikroservisler birbirlerinin veritabanına doğrudan erişmek yerine API üzerinden konuşur. Timeout, yavaş veya kapalı bir servisin diğer servisi uzun süre meşgul etmesini önler.

## Ne anlamadım / kafama takılanlar
- Tekli servis çağrıları ile toplu servis çağrılarının performans farkı ne kadar olur?
- RestClient yerine hangi durumlarda mesaj kuyruğu kullanılmalıdır?

## Yarın standup'ta sormak istediğim
Servisler arası çağrılarda retry ve circuit breaker ne zaman kullanılmalıdır?