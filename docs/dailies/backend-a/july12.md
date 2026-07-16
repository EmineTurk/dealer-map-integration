# Gün 5 — Swagger, DTO, Validation ve Hata Yönetimi

## Bugün ne yaptım

Stock Service projesine Swagger/OpenAPI desteği ekledim ve ürün endpoint'lerini Swagger arayüzünde dokümante ettim. ProductEntity nesnesini doğrudan API response olarak dönmek yerine ProductResponse DTO kullandım. Ayrıca ürün ID'sine göre sorgulama, validation ve merkezi hata yönetimi ekledim.

## Ne anladım

DTO'nun veritabanı entity'si ile API response modelini birbirinden ayırdığını anladım. Böylece entity içindeki her alanı dışarı açmak zorunda kalmıyoruz ve API sözleşmesini daha kontrollü yönetebiliyoruz.

`@RestControllerAdvice` ve `@ExceptionHandler` kullanarak farklı controller'larda oluşan hataların tek bir yerden yönetilebildiğini öğrendim.

`@Positive` annotation'ı ile path variable değerinin pozitif olması gerektiğini doğruladım. Validation hatasını yakalamazsam sistemin 500 dönebildiğini, doğru exception handler ile bunun 400 Bad Request olarak dönmesi gerektiğini gördüm.

Swagger'ın endpoint'leri hem dokümante etmek hem de tarayıcı üzerinden test etmek için kullanılabildiğini öğrendim.

## Ne anlamadım / kafama takılanlar

- IntelliJ, Spring tarafından annotation üzerinden çağrılan exception handler metotlarını neden bazen "never used" olarak gösteriyor?
- Büyük projelerde DTO dönüşümleri manuel mi yapılır, yoksa MapStruct gibi araçlar mı tercih edilir?
- Her exception için ayrı handler yazmak yerine ortak bir yapı nasıl tasarlanır?

## Yarın standup'ta sormak istediğim

Validation hatalarının tamamını aynı ApiError formatında yönetmenin en iyi yöntemi nedir?