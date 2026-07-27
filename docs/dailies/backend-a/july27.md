# Gün 16 — Multi-Stage Docker Image

## Bugün ne yaptım

`stock-service` için multi-stage bir Dockerfile hazırladım. Build aşamasında
Maven ve JDK 21 kullanarak executable Spring Boot JAR dosyasını ürettim; runtime
aşamasında yalnızca Java 21 JRE ve uygulama JAR'ını bıraktım. Uygulamayı root
yerine `spring` kullanıcısıyla çalıştırdım ve gereksiz dosyaların build
context'ine girmemesi için `.dockerignore` ekledim.

Image'ı `stock-service:day16` etiketiyle build ettim. Ortaya çıkan final image
yaklaşık 141,7 MB oldu. Container'ı Oracle ve Redis'in bulunduğu Compose ağına
bağladım; health endpoint'inin `UP` döndüğünü, ürün listesinin ve OpenAPI
dokümanının HTTP 200 verdiğini doğruladım. Mevcut 35 Stock Service testi de
başarıyla geçti.

Gerçek entegrasyon kontrolü için `store-service`i çalıştırarak aynı stok-bayi
sorgusunu iki kez gönderdim. Cold istek yaklaşık 607 ms, Redis'ten karşılanan
warm istek yaklaşık 12 ms sürdü. İki cevap birebir aynıydı ve beklenen Redis
cache anahtarı oluştu. İkinci image build'inde bütün Docker katmanlarının
cache'ten kullanıldığını da gözlemledim.

Entegrasyon sırasında `store-service`in Hibernate `ddl-auto: update` ayarı,
Oracle'daki `NUMBER(1)` tipindeki `opens_weekend` sütununu `BOOLEAN` tipine
çevirmeye çalıştığı için `ORA-01463` uyarısı üretti. Şema zaten SQL script'leriyle
yönetildiğinden bu ayarı `none` yaptım. Üç Store Service testi geçti; gerçek
Oracle başlangıcında health ve bayi endpoint'i HTTP 200 döndü ve uyarı tekrar
oluşmadı.

## Ne anladım

Multi-stage build sayesinde derleme araçlarının production image'ına
taşınmadığını öğrendim. Maven ve tam JDK yalnızca build sırasında gerekli;
uygulamayı çalıştırmak için daha küçük bir JRE image'ı yeterli. Bu ayrım image
boyutunu ve saldırı yüzeyini azaltıyor.

Docker layer cache'in Dockerfile sırasına bağlı olduğunu gördüm. Önce yalnızca
`pom.xml` dosyasını kopyalayıp bağımlılıkları indirmek, kaynak kod değiştiğinde
Maven bağımlılık katmanının yeniden oluşturulmasını engelliyor. `.dockerignore`
ise Docker daemon'a gönderilen context'i küçülterek build sürecini hızlandırıyor.

Container içinden `localhost`, host makineyi veya başka bir container'ı ifade
etmiyor. Compose ağında Oracle ve Redis'e servis adlarıyla; hostta çalışan
`store-service`e ise `host.docker.internal` üzerinden erişmek gerektiğini
öğrendim. Ayrıca uygulamayı non-root kullanıcıyla çalıştırmanın container
güvenliği açısından temel bir önlem olduğunu anladım.

Veritabanı şeması SQL script'leriyle yönetiliyorsa Hibernate'in aynı şemayı
`ddl-auto: update` ile değiştirmeye çalışması iki farklı şema sahibi oluşturuyor.
Tek bir migration yaklaşımı seçmek, ortamlar arasında beklenmeyen DDL
değişikliklerini önlüyor.

## Ne anlamadım / kafama takılanlar

- Spring Boot layered JAR veya `jlink` kullanımı final image boyutunu ne kadar
  daha küçültebilir?
- Base image etiketlerini digest ile sabitlemek güvenlik ve güncelleme yönetimini
  nasıl etkiler?
- CI içinde image vulnerability taraması için Trivy, Docker Scout veya başka
  bir araçtan hangisini standartlaştırmalıyız?
- Maven bağımlılık cache'ini BuildKit cache mount ile kullanmak uzak CI
  ortamlarında ne kadar hız kazandırır?

## Yarın standup'ta sormak istediğim

Gün 17 Compose çalışmasında servis image'larını digest ile sabitleyip otomatik
güvenlik taraması eklemeli miyiz, yoksa önce bütün sistemi tek komutla ayağa
kaldırmaya mı odaklanmalıyız?
