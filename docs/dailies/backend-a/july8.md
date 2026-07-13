# Gün 1 — Spring Boot ve Stock Service Kurulumu

## Bugün ne yaptım

- Bugün "Backend A" olarak sorumlu olduğum `stock-service` mikro servisinin temel Spring Boot iskeletini oluşturdum. Spring Initializer üzerinden gerekli dependencyleri seçerek projeyi oluşturdum ve IntelliJ IDEA üzerinde çalıştırdım.

- Docker Desktop ve Postman kurulumlarını yaptım. Ayrıca Spring Boot Actuator ile `http://localhost:8080/actuator/health` endpoint’ini test ettim ve servisin  `UP` durumunda çalıştığını gördüm.

- Son olarak projenin github reposu açıldı ve ilk commit atıldı.

## Ne anladım

- Spring Boot’un Java ile hızlı şekilde backend uygulaması başlatmayı kolaylaştırdığını anladım. `application.yml` dosyasının uygulama ayarlarını tutmak için kullanıldığını öğrendim. SB deki Jar ve war dosya tiplerinin farkını öğrendim. 

- Port kavramının, bilgisayardaki farklı uygulamaların birbirinden ayrılması için kullanıldığını anladım. Spring Boot’un varsayılan olarak `8080` portunda çalıştığını ve bu portun istenirse değiştirilebileceğini öğrendim. Ve iki mikroservis aynı porta çalışamaz onu öğrendim.

- GitHub tarafında `main` branch’in temiz ve çalışan kodu tutması gerektiğini, yeni geliştirmelerin ise ayrı branch’lerde yapılıp Pull Request ile `main` branch’e alınmasının daha doğru olduğunu öğrendim.

- WSL nedir?  Windows içinde Linux kullanmanın pratik yoludur.

- Endpoint nedir? bir API’de belli bir işi yapan kapıdır/adrestir.         
  `GET https://api.example.com/users/123` 


## Ne anlamadım / kafama takılanlar

- Spring Boot çalışırken arka planda gömülü Tomcat’in tam olarak nasıl çalışıyor?
- Git branch yapısını anladım fakat ekip içinde hangi durumda yeni branch açmamız gerektiğini pratikte daha iyi oturtmam gerekiyor.

## Yarın standup'ta sormak istediğim

- Controller, service ve repository katmanları arasındaki farklar nedir?
- Gün 2’de yazılacak `GET /products` endpoint’inde DTO kullanımı nasıl olmalı?
- Frontend farklı portlardaki farklı mikroservislerle nasıl iletişim kuruyor?
- Bir API Contract nasıl oluşturulur?

