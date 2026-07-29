# Gün 16 - Multi-stage Docker image

## Bugün ne yaptım
Backend B nin iki servisi için multi-stage Dockerfile yazdım: store-service (EXPOSE 8081) ve capability-service (EXPOSE 8082). Build aşamasında Maven 3.9 ve Temurin 21 ile JAR üretiliyor; runtime da yalnızca JRE alpine ve non-root spring kullanıcısı kalıyor. Her iki servise de .dockerignore ekledim (target, postman, sql, IDE dosyaları context dışı). Ortam değişkenleri kök .env.example ve application.yaml üzerinden okunuyor (STORE_DB_*, CAPABILITY_DB_*, REDIS_HOST, STORE_SERVICE_BASE_URL); lokal için .env.example dan .env kopyalanabiliyor. Container içinden Oracle/Redis e servis adlarıyla, hosttaki komşu servise host.docker.internal ile bağlanılacak şekilde tasarlandı. Gün 17 deki ortak docker-compose app servislerine dokunmadım; yalnızca kendi iki image ımın build edilebilir olması hedefiydi. capability-service ddl-auto ayarını none yaptım çünkü şema SQL scriptlerle yönetiliyor.

## Ne anladım
Multi-stage sayesinde Maven ve JDK final image a girmiyor; image boyutu ve saldırı yüzeyi küçülüyor. Önce pom.xml kopyalayıp dependency layer ı cachelemek kaynak değişince bağımlılıkların yeniden indirilmesini engeller. Container içinden localhost host makineyi veya başka container ı ifade etmez; compose ağında servis adları kullanılır. Şema SQL ile yönetiliyorsa Hibernate ddl-auto update ortamlar arası sürpriz DDL üretebilir, none daha güvenli. Spring Boot .env dosyasını otomatik okumaz; docker compose kök .env i kullanır, lokal run da yaml default veya OS env yeterlidir.

## Ne anlamadım / kafama takılanlar
- Layered JAR veya jlink image boyutunu ne kadar daha küçültür?
- CI da vulnerability tarama için Trivy mi standart olmalı?

## Yarın standup'ta sormak istediğim
Gün 17 compose ta store/capability healthcheck ve depends_on sırasını (oracle → redis → store → capability → gateway) nasıl sabitleyeceğiz?
