# Gün 17 — Docker Compose ile Tüm Sistemin Orkestrasyonu

## Bugün ne yaptım

Oracle, Redis, `store-service`, `stock-service`, `capability-service`, API
Gateway ve Nginx üzerinde çalışan frontend'i kök `docker-compose.yml` dosyasında
birleştirdim. Böylece bütün sistemin proje kökünden tek bir
`docker compose up -d --build --wait` komutuyla build edilip doğru sırada
başlatılmasını sağladım.

Her uygulama için port, environment variable, healthcheck, `depends_on` ve
restart politikasını tanımladım. Başlatma sırasını Oracle ve Redis'ten
`store-service`e, oradan Stock ve Capability servislerine, daha sonra API
Gateway'e ve son olarak frontend'e ilerleyecek şekilde kurdum. Uygulama
servisleri bağımlılıklarının yalnızca başlamasını değil, `healthy` durumuna
gelmesini bekliyor.

Container'lar arasındaki adresleri hosttaki `localhost` değerlerinden Compose
servis adlarına çevirdim. Stock ve Capability servisleri Store Service'e
`http://store-service:8081`; API Gateway ise downstream servislere
`http://stock-service:8080`, `http://store-service:8081` ve
`http://capability-service:8082` adresleriyle ulaşıyor. Oracle bağlantılarında
host olarak `oracle`, Redis bağlantılarında ise `redis` kullanılıyor.

Frontend production build'ine `/gateway` göreli adresini verdim ve Nginx'e bu
yolu `api-gateway:8085` servisine yönlendiren reverse proxy kuralı ekledim.
Böylece tarayıcı Compose içindeki servis adını çözmek zorunda kalmadan aynı
origin üzerinden API Gateway'e erişebiliyor. React Router sayfalarının doğrudan
yenilenebilmesi için mevcut SPA fallback kuralını da korudum.

Oracle ve Redis verilerini named volume'larda kalıcı tuttum. Oracle'ın ilk
kurulum script'lerine Store, Capability, Product ve Stock seed dosyalarını
doğru sırayla bağladım. README ve `.env.example` dosyalarını tek komutla
çalıştırma, servis portları ve gerekli ortam değişkenleriyle güncelledim.

Canlı doğrulamada bütün container'ların health durumunu, frontend'in
`http://localhost:8080` üzerinden açıldığını, Gateway'in `8085` portundan ürün
ve bayi sorgularını yönlendirdiğini ve servislerin Compose ağı içinde birbirine
ulaşabildiğini kontrol ettim. Frontend ve backend image'larını ayrı ayrı yeniden
oluşturabildiğimi; örneğin yalnızca frontend değiştiğinde
`docker compose up -d --build --no-deps frontend` komutunun diğer servisleri
yeniden başlatmadığını da test ettim.

## Ne anladım

Docker Compose ağında her servis adının dahili bir DNS kaydı gibi çalıştığını
öğrendim. Bir container içindeki `localhost` yalnızca o container'ı gösteriyor;
başka bir servise ulaşmak için Compose servis adı ve container portu
kullanılmalı. Host portları ise tarayıcı, Postman veya DBeaver gibi Compose ağı
dışındaki istemciler içindir.

`depends_on` tek başına uygulamanın kullanıma hazır olduğunu garanti etmiyor.
`condition: service_healthy` ile birlikte kullanıldığında sonraki servis,
bağımlılığın healthcheck'i başarılı olana kadar bekliyor. Oracle'ın ilk açılışı
diğer servislere göre daha uzun sürdüğü için `start_period`, `interval`,
`timeout` ve `retries` değerlerinin servisin gerçek başlangıç süresine göre
ayarlanması gerektiğini gördüm.

Frontend açısından browser ile container ağı arasındaki farkı daha iyi
anladım. Nginx container'ı `api-gateway` adını çözebilir ancak kullanıcının
tarayıcısı çözemez. Bu nedenle frontend'in `/gateway` gibi göreli bir URL'ye
istek göndermesi ve Nginx'in isteği Compose ağı içindeki Gateway'e proxy etmesi
hem adres yönetimini kolaylaştırıyor hem de CORS ihtiyacını azaltıyor.

Named volume'ların container yaşam döngüsünden bağımsız olduğunu öğrendim.
`docker compose down` container'ları ve ağı kaldırırken Oracle ve Redis
verilerini koruyor. `docker compose down --volumes` ise kalıcı veriyi de
sildiği için normal geliştirme akışında dikkatli kullanılmalı. Ayrıca Oracle
init script'leri yalnızca boş volume ilk kez hazırlanırken çalışıyor; mevcut
veriyi güncellemek gerektiğinde uygulama data loader'ı veya ayrı bir migration
yaklaşımı gerekiyor.

Compose içinde explicit default bridge network tanımlamak servisleri aynı izole
ağda topluyor. Bu yapı geliştirme ortamı için yeterli olsa da production'da
secret yönetimi, TLS, merkezi loglama, resource limitleri ve birden fazla
instance için daha kapsamlı bir orkestrasyon yaklaşımı gerekebilir.

## Ne anlamadım / kafama takılanlar

- Healthcheck başarısız olduğunda yalnızca container restart etmek yerine hangi
  durumlarda circuit breaker veya otomatik rollback uygulanmalı?
- Oracle init script'leri yerine Flyway ya da Liquibase kullanmak mevcut
  volume'larda şema ve seed güncellemelerini daha güvenli hale getirir mi?
- Compose ortamındaki parolaları `.env` yerine Docker Secrets veya harici bir
  secret manager ile yönetmeye ne zaman geçmeliyiz?
- CI ortamında `docker compose up --wait` sonrasında entegrasyon testlerini
  çalıştırıp başarısızlık halinde servis loglarını artifact olarak nasıl
  saklamalıyız?
- Redis hem cache hem rate-limit verisi taşıyorsa cache temizleme işlemlerini
  diğer anahtarlara zarar vermeden nasıl sınırlandırmalıyız?

## Yarın standup'ta sormak istediğim

Gün 18 unit test çalışmasında Compose entegrasyonunu ayrıca ayağa kaldırmadan
StockLevel eşikleri ve mesafe hesabı gibi domain kurallarını izole test etmek
için hangi bağımlılıkları mock'lamalı, hangilerini gerçek nesne bırakmalıyız?
