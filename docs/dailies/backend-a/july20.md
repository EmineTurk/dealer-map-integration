# Gün 11 — Redis Cache ve TTL

## Bugün ne yaptım

Stock Service'e Redis cache desteği ekledim. Spring Data Redis ve Spring Cache
bağımlılıklarını projeye dahil ettim. Redis bağlantısını `application.yaml`
içinde host, port ve timeout değerleri environment variable ile değiştirilebilir
olacak şekilde yapılandırdım.

Proje planına uygun olarak
`GET /products/{id}/stores?lat=&lng=&radius=` akışındaki
`ProductStockService.getStoresByProductId()` metodunu `@Cacheable` ile
cache'ledim. Stok verisi hızlı değişebildiği için TTL değerini 5 dakika
olarak belirledim.

Cache anahtarına `productId`, `lat`, `lng` ve `radius` değerlerinin tamamını
ekledim. Böylece aynı ürün için farklı konum veya yarıçapla yapılan aramalar
birbirinin sonucunu kullanmıyor. Aynı Redis instance'ını kullanan diğer
servislerle anahtar çakışmasını önlemek için
`stock-service::product-stores::` prefix'ini kullandım.

Ürün kataloğunu cache'lemedim; Day 11 kapsamındaki cache hedefini doğrudan
ürün-bayi stok sorgusu olarak tuttum. Redis geçici olarak erişilemez olduğunda
endpoint'in tamamen hata vermemesi için `CacheErrorHandler` kullandım. Cache
okuma veya yazma işlemi başarısız olduğunda hata loglanıyor ve sorgu Oracle ile
Store Service üzerinden çalışmaya devam ediyor.

Cache davranışı için Spring proxy ve in-memory `CacheManager` kullanan otomatik
testler ekledim. Aynı parametrelerle iki kez arama yapıldığında repository ve
Store Service portlarının yalnızca bir kez çağrıldığını; radius değiştiğinde ise
ayrı bir cache entry kullanıldığını doğruladım. Ayrıca 5 dakikalık TTL, servis
prefix'i, Redis hatasında devam etme davranışı ve stok-bayi DTO listesinin JSON
olarak serialize/deserialize edilmesi için testler yazdım. Java 21 ile toplam
23 testin tamamı başarılı oldu.

Hit/miss durumlarını gözlemlemek için `CacheInterceptor` TRACE log seviyesini
açtım. Docker Compose içindeki ortak Redis servisi kalıcı volume ve healthcheck
ile kullanılacak şekilde tanımlı.

## Ne anladım

Cache anahtarının yalnızca ürün ID'sinden oluşmasının yeterli olmadığını
öğrendim. Sonuç kullanıcı konumu ve radius değerine de bağlı olduğu için sonucu
etkileyen bütün parametreler cache anahtarının parçası olmalıdır.

TTL kararının verinin değişim hızına göre verilmesi gerektiğini anladım. Stok
verisi kısa sürede değişebildiği için 1 saat eski sonuç gösterme riskini
artırırken, 5 dakika performans ile güncellik arasında daha uygun bir dengedir.

`@Cacheable` annotation'ının Spring proxy üzerinden çalıştığını öğrendim. Aynı
anahtarla gelen ikinci çağrıda metodun gövdesi çalışmadan sonuç cache'ten
döner. Parametrelerden biri değiştiğinde ise yeni anahtar oluşur ve veri
kaynakları yeniden çağrılır.

Aynı Redis instance'ını birden fazla mikroservis kullandığında servis bazlı
prefix kullanmanın anahtar çakışmalarını önlediğini, Redis erişilemediğinde ise
cache'in ana iş akışını durdurmaması için kontrollü fallback uygulanabileceğini
gördüm.

## Ne anlamadım / kafama takılanlar

- Aynı ürünün farklı koordinat ve radius değerleriyle çok fazla cache anahtarı
  üretmesi Redis belleğini ne kadar etkiler?
- Stok güncellendiğinde yalnızca ilgili ürüne ait anahtarları mı, yoksa
  `product-stores` cache'indeki tüm anahtarları mı temizlemeliyiz?
- Çok sayıda kullanıcı aynı anda süresi dolmuş bir cache anahtarını isterse
  cache stampede problemi nasıl önlenir?
- Production ortamında Redis parola, TLS ve yüksek erişilebilirlik ayarları
  nasıl yönetilir?

## Yarın standup'ta sormak istediğim

Stok güncellemesinden sonra aynı ürüne ait farklı konum ve radius anahtarlarını
tutarlı biçimde temizlemek için `@CacheEvict(allEntries = true)` ile tüm cache'i
temizlemek mi, yoksa ürün bazlı kontrollü invalidation tasarlamak mı daha doğru
olur?
