# Gün 4 — Spring Boot Oracle Entegrasyonu

## Bugün ne yaptım

- Bugün `stock-service` mikroservisini Oracle Database'e bağladım. `application.yaml` dosyasında datasource ayarlarını yaparak Spring Boot'un Oracle ile iletişim kurmasını sağladım.

- `ProductEntity` ve `ProductRepository` sınıflarını oluşturdum. Daha sonra `ProductService` sınıfını güncelleyerek ürünleri sabit liste yerine Oracle veritabanından okuyacak hale getirdim.

- `GET /products` endpoint'ini test ettim ve ürünlerin Oracle Database'den başarıyla JSON formatında döndüğünü gördüm.

- Son olarak `schema.sql` ve `data.sql` dosyalarını oluşturdum ve yapılan değişiklikler için Pull Request açtım.

## Ne anladım

- JPA'nın veritabanındaki tabloları Entity sınıfları ile eşleştirdiğini öğrendim.

- Repository katmanının SQL yazmadan veritabanı işlemlerini gerçekleştirdiğini gördüm.

- Spring Boot'un Oracle bağlantısını HikariCP üzerinden yönettiğini öğrendim.

- Controller → Service → Repository → Database mimarisinin nasıl çalıştığını uygulamalı olarak gördüm.

## Ne anlamadım / kafama takılanlar

- JPA arka planda oluşturduğu SQL sorgularını tam olarak nasıl üretiyor?

- `JpaRepository` içerisindeki metotlar (findAll, save vb.) arka planda nasıl çalışıyor?

## Yarın standup'ta sormak istediğim


- Büyük projelerde veritabanı migration işlemleri için neden Flyway veya Liquibase kullanılıyor?

- Repository'de kendi sorgularımızı ne zaman yazmamız gerekiyor?