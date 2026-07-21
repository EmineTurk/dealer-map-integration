# Gün 11 - Redis cache ve TTL

## Bugün ne yaptım
Docker Compose'a Redis 7 servisi, kalıcı volume ve healthcheck ekledim. store-service'te tüm bayi, ID, toplu ID ve bölgesel sorguları; capability-service'te işlem tipi listesi ve geo/filtreli bayi sorgusunu Spring Cache `@Cacheable` ile cache'ledim. Bayi ve yetkinlik verisi sık değişmediği için TTL'i 1 saat yaptım; iki servisin key prefix'lerini ayırdım ve hit/miss durumlarını loglardan izlemek için CacheInterceptor TRACE logunu açtım.

## Ne anladım
Cache, aynı pahalı sorgunun DB ve servisler arası HTTP çağrısını tekrar etmesini engeller. TTL kararı verinin değişim hızına göre verilir: stok dakikalar içinde değişirken bayi master data ve capability bilgisi daha statiktir, bu nedenle 1 saat kabul edilebilir. Prefix kullanmak aynı Redis instance'ını paylaşan servislerin anahtarlarının çakışmasını önler; JSON serializer ise DTO listelerinin Redis'te güvenli biçimde saklanıp geri okunmasını sağlar.

## Ne anlamadım / kafama takılanlar
- Bayi veya capability güncelleme endpoint'i geldiğinde hangi cache'leri `@CacheEvict` ile temizlemeliyiz?
- Redis erişilemez olduğunda servis fail-fast mi olmalı, yoksa cache'siz DB sorgusuna devam mı etmeli?

## Yarın standup'ta sormak istediğim
Gün 12'de veri güncellemesi eklenirse cache invalidation'ı tek kayıt, liste ve filtre cache'leri arasında nasıl tutarlı yöneteceğiz?
