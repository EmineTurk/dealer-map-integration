# Gün 11 — Redis Cache ve TTL

## Bugün ne yaptım

Stock Service'e Redis cache desteği ekledim. Spring Data Redis ve Spring Cache bağımlılıklarını projeye dahil ettim. Redis bağlantısını `application.yaml` içinde host, port ve timeout değerleri environment variable ile değiştirilebilir olacak şekilde yapılandırdım.

Ürün kataloğu sık değişmediği için `GET /products` akışındaki `ProductService.getAllProducts()` metodunu `@Cacheable` ile cache'ledim. Cache süresini 1 saat olarak belirledim ve aynı Redis instance'ını kullanan diğer servislerle anahtar çakışmasını önlemek için `stock-service::products::` prefix'ini kullandım. Cache anahtarını `all` olarak tanımladım.

Stoklu bayi aramasını cache'lemedim. Bu sonuç ürün ID'si, kullanıcının koordinatları, radius değeri ve güncel stok miktarına bağlı olduğu için uzun süreli cache'in eski stok bilgisi döndürme riski olduğunu gördüm.

Redis geçici olarak erişilemez olduğunda `/products` endpoint'inin tamamen hata vermemesi için özel bir `CacheErrorHandler` ekledim. Böylece cache okuma veya yazma işlemi başarısız olursa hata loglanıyor ve ürünler Oracle'dan okunmaya devam ediyor.

Cache davranışı için Spring proxy üzerinden çalışan otomatik test ekledim. Aynı ürün listesi iki kez istendiğinde repository metodunun yalnızca bir kez çağrıldığını doğruladım. Ayrıca 1 saatlik TTL, servis prefix'i, Redis kapalıyken devam etme davranışı ve ürün listesinin JSON olarak serialize/deserialize edilmesi için testler yazdım. Toplam 22 testin tamamı başarılı oldu.

Son olarak uygulamayı gerçek Redis container'ıyla çalıştırdım. `stock-service::products::all` anahtarının oluştuğunu, TTL değerinin yaklaşık 3600 saniye olduğunu ve `/actuator/caches` endpoint'inde `products` cache'inin göründüğünü doğruladım.

## Ne anladım

Cache'in sık kullanılan verileri bellekte tutarak aynı verinin her istekte veritabanından okunmasını engellediğini öğrendim. İlk istekte veri Oracle'dan okunup Redis'e yazılıyor, sonraki isteklerde ise doğrudan Redis'ten dönüyor.

TTL değerinin cache'teki verinin ne kadar süre geçerli kalacağını belirlediğini anladım. Ürün kataloğu nispeten statik olduğu için 1 saat uygunken, stok miktarı daha hızlı değiştiği için aynı TTL'in stok sonuçlarında kullanılmasının yanlış veri gösterebileceğini gördüm.

`@Cacheable` annotation'ının doğrudan oluşturulan bir Java nesnesinde değil, Spring proxy'si üzerinden çalıştığını öğrendim. Bu nedenle cache davranışını test ederken Spring context ve in-memory `CacheManager` kullanmak gerektiğini gördüm.

Aynı Redis instance'ını birden fazla mikroservis kullandığında servis bazlı key prefix tanımlamanın anahtar çakışmalarını önlediğini anladım. Ayrıca DTO listelerini Redis'te saklamak için JSON serialization ve geri okuma davranışının test edilmesi gerektiğini öğrendim.

## Ne anlamadım / kafama takılanlar

- Ürün ekleme veya güncelleme endpoint'i geldiğinde `products` cache'ini `@CacheEvict` ile hangi noktada temizlemeliyiz?
- Çok sayıda kullanıcı aynı anda süresi dolmuş bir cache anahtarını isterse cache stampede problemi nasıl önlenir?
- Production ortamında Redis bağlantısı için parola, TLS ve yüksek erişilebilirlik ayarları nasıl yönetilir?
- Stok sonuçlarını cache'lemek gerekirse doğru TTL ve cache key yapısı nasıl belirlenmelidir?

## Yarın standup'ta sormak istediğim

Ürün kataloğuna yazma endpoint'leri eklendiğinde liste cache'ini her değişiklikte tamamen temizlemek mi, yoksa ilgili anahtarları daha kontrollü güncellemek mi daha doğru olur?
