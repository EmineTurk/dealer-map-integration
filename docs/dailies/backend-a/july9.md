# Gün 2 — REST, HTTP Metotları ve Status Kodları

## Bugün ne yaptım

Bugün stock-service içinde ilk endpoint olan GET /products endpoint’ini yazdım. Ürünleri şimdilik in-memory bir liste üzerinden döndürdüm ve Postman ile test ettim.

## Ne anladım

REST yapısında endpoint’lerin belirli kaynakları temsil ettiğini anladım. GET metodunun veri okumak için kullanıldığını ve başarılı isteklerde genellikle 200 OK döndüğünü öğrendim.

- `@RestController`: Bu sınıfın REST API endpoint'leri sunduğunu belirtir.
- `@RequestMapping("/products")`: Bu controller'ın temel URL'ini belirler.
- `@GetMapping`: GET isteğini karşılar.
- `@PostMapping`: POST isteğini karşılar.
- `@PutMapping`: PUT isteğini karşılar.
- `@DeleteMapping`: DELETE isteğini karşılar.

## Ne anlamadım / kafama takılanlar

- Controller ve Service ayrımını tam olarak ne zaman yapmamız gerekiyor tam oturmadı.
- DTO ile Entity arasındaki farkı ileride veritabanına geçince daha net görürüm. şu an tam oturmadı.

## Yarın standup'ta sormak istediğim

GET /products endpoint’i ileride veritabanına bağlanınca response formatını bozmadan nasıl güncellenir?