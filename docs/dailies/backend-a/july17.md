# Gün 10 — Mikroservis Entegrasyonu, CORS ve Uçtan Uca Testler
## Bugün ne yaptım

Stock Service’in frontend ve diğer backend servisleriyle entegrasyonunu test ettim. Oracle üzerinde Stock Service için ayrı `stock_app` kullanıcısını oluşturdum. `PRODUCT` ve `STOCK` tablolarını proje içindeki SQL dosyalarına göre hazırlayıp örnek verileri yükledim.

IntelliJ çalışma ayarlarında Stock Service’in yanlışlıkla `SYSTEM` kullanıcısıyla Oracle’a bağlandığını fark ettim. Environment variable değerlerini `stock_app` kullanacak şekilde düzelttim.

Stock Service’e CORS yapılandırması ekledim. Vite frontend’in varsayılan `http://localhost:5173` adresinden Stock Service’e istek gönderebilmesini sağladım. CORS origin değerini environment variable ile değiştirilebilir hale getirdim ve preflight isteği için otomatik test ekledim.

Üç mikroservisi birlikte çalıştırarak aşağıdaki senaryoları Postman ile doğruladım:

- Ürünlerin Oracle’dan listelenmesi
- Stock Service’in Store Service’ten toplu bayi bilgisi alması
- Bayilerin radius değerine göre filtrelenmesi
- Sonuçların mesafeye göre sıralanması
- Ham stok miktarı yerine `stockLevel` dönülmesi
- Olmayan ürün için `404`
- Geçersiz veya eksik parametre için `400`
- Stok bulunmadığında `200 OK` ve boş liste
- Store Service kapalı olduğunda `503`

Son olarak otomatik testleri çalıştırdım ve 18 testin tamamının başarılı olduğunu doğruladım.

## Ne anladım

CORS’un backend endpoint’lerini güvenli hale getiren bir kimlik doğrulama sistemi olmadığını öğrendim. CORS, tarayıcının farklı origin’ler arasındaki isteklere izin verilip verilmediğini kontrol ediyor.

Frontend ve backend aynı bilgisayarda çalışsa bile portları farklı olduğunda tarayıcı bunları farklı origin olarak değerlendiriyor. Bu projede frontend `5173`, Stock Service ise `8080` portunda çalıştığı için CORS yapılandırmasına ihtiyaç duyuluyor.

Tarayıcının bazı isteklerden önce `OPTIONS` metoduyla preflight isteği gönderdiğini öğrendim. Postman CORS kontrolü uygulamadığı için Postman’de çalışan bir endpoint’in frontend’de CORS hatası verebileceğini anladım.

Ayrıca her mikroservisin kendi Oracle kullanıcısı ve şemasıyla çalışmasının tablo sahipliğini ve servis sınırlarını daha anlaşılır hale getirdiğini gördüm.

## Ne anlamadım / kafama takılanlar

- API Gateway eklendiğinde servislerdeki CORS ayarlarını tamamen kaldırmalı mıyız?
- Birden fazla frontend origin’ine production ortamında güvenli şekilde nasıl izin verilir?
- CORS yapılandırmasında `allowedHeaders("*")` kullanmak yerine hangi header’ları açıkça tanımlamalıyız?
- Store Service geçici olarak kapandığında timeout dışında circuit breaker kullanmak gerekli mi?

## Yarın standup’ta sormak istediğim

Day 11 Redis çalışmasında yalnızca ürün kataloğunu mu cache’leyeceğiz, yoksa ürün–bayi stok sonuçlarını da kısa bir TTL ile cache’lemek uygun olur mu?