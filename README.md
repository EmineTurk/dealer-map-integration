# Bayi Harita Entegrasyonu

Pasaj (**Yakınımda Stokta**) ve turkcell.com.tr (**Yakınımda İşlem**) için ortak microservice altyapısı: harita üzerinde stok ve işlem yetkinliği.

| Modül | Sorumlu | Açıklama |
|-------|---------|----------|
| Pasaj — Yakınımda Stokta | Backend A | Ürünün hangi bayide stokta olduğu |
| com.tr — Yakınımda İşlem | Backend B | Seçilen işlemi yapabilen en yakın bayiler |
| React uygulaması | Frontend | Her iki modül tek UI |

API sözleşmesi: [`docs/api-contract.md`](docs/api-contract.md)

---

## Mimari

```
React (:8080) ──▶ API Gateway (:8085)
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
  stock-service  store-service  capability-service
   (Pasaj / A)    (ortak / B)     (com.tr / B)
        │             │             │
        └─────────────┴─────────────┘
                 Oracle + Redis
```

`store-service` bayi master data’nın tek kaynağıdır. `stock-service` ve `capability-service` yalnızca `storeId` tutar; detay için store-service’e sorar.

---

## Proje yapısı

```text
dealer-map-integration/
├── docker-compose.yml      # Tüm sistemi tek komutla ayağa kaldırır
├── .env.example            # Ortam değişkeni şablonu
├── docker/oracle/init/     # Ortak Oracle kullanıcıları
├── api-gateway/            # :8085
├── stock-service/          # Backend A (host :8083 → container :8080)
├── store-service/          # Backend B — bayi master data (:8081)
├── capability-service/     # Backend B — işlem yetkinliği (:8082)
├── frontend/               # React + Nginx (:8080)
└── docs/                   # API contract, günlükler
```

---

## Hızlı başlangıç (Docker)

**Gereksinim:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) açık olsun.

```bash
# 1) Ortam dosyası (opsiyonel — compose içinde varsayılanlar da var)
cp .env.example .env

# 2) Tüm sistemi build + başlat (Oracle ilk seferde birkaç dakika sürebilir)
docker compose up -d --build --wait

# 3) Durum
docker compose ps
```

Durdurma:

```bash
docker compose down          # veriler kalır
docker compose down -v       # Oracle/Redis volume'ları da silinir (sıfırdan init)
```

Başlatma sırası healthcheck ile yönetilir:

`Oracle → Redis → store-service → stock / capability → gateway → frontend`

---

## Adresler

| Servis | URL |
|--------|-----|
| Frontend | http://localhost:8080 |
| API Gateway (health) | http://localhost:8085/actuator/health |
| Store API / Swagger | http://localhost:8081 · [Swagger](http://localhost:8081/swagger-ui.html) |
| Capability API / Swagger | http://localhost:8082 · [Swagger](http://localhost:8082/swagger-ui.html) |
| Stock API | http://localhost:8083 |
| Oracle | `localhost:1521` / `FREEPDB1` |
| Redis | `localhost:6379` |

Gateway üzerinden örnek istekler:

```http
GET http://localhost:8085/api/stores?city=Istanbul
GET http://localhost:8085/api/pasaj/products
GET http://localhost:8085/api/comtr/capabilities/types
GET http://localhost:8085/api/comtr/capabilities/DEVICE_REPAIR/stores?lat=41.02&lng=29.01&radius=10
```

> Kök URL’ler (`http://localhost:8081/` vb.) 404 döner; bunlar API servisidir. UI için **8080**, deneme için Swagger veya Gateway path’lerini kullanın.

---

## Ortam değişkenleri

Şablon: [`.env.example`](.env.example) → kopyala: `.env` (gitignore’da).

| Değişken | Varsayılan | Not |
|----------|------------|-----|
| `ORACLE_PASSWORD` | `OraclePassword123` | SYS / container |
| `STORE_DB_USERNAME` / `PASSWORD` | `store_app` / `StoreApp123` | Store + capability şeması |
| `STOCK_DB_USERNAME` / `PASSWORD` | `stock_app` / `StockApp123` | Stock şeması |
| `VITE_ENABLE_MOCK_FALLBACK` | `false` | Frontend build arg |

Compose içinde container’lar birbirini servis adıyla bulur (`oracle`, `redis`, `store-service`). `.env` içindeki `localhost` değerleri özellikle **IDE / lokal Maven** koşuları içindir.

---

## Lokal geliştirme (Maven)

Tüm backend servisleri **Java 21** ister. Windows’ta `mvnw.cmd`, IntelliJ Corretto 21 kurulumunu (`%USERPROFILE%\.jdks\corretto-21*`) otomatik seçebilir. Farklı bir JDK kullanıyorsanız:

```bash
# PowerShell örneği
$env:DEALER_MAP_JAVA_HOME = "C:\path\to\jdk-21"
```

Oracle ve Redis’in ayakta olması gerekir (`docker compose up -d oracle redis` yeterli olabilir).

### Backend B

```bash
cd store-service && mvnw.cmd spring-boot:run
cd capability-service && mvnw.cmd spring-boot:run
```

Capability, store’a `STORE_SERVICE_BASE_URL` (varsayılan `http://localhost:8081`) ile bağlanır.

### Backend A

```bash
cd stock-service && mvnw.cmd spring-boot:run
```

### Gateway

```bash
cd api-gateway && mvnw.cmd spring-boot:run
```

## Sorumluluklar

| Servis | Port | Sahip | Görev |
|--------|------|-------|-------|
| `store-service` | 8081 | Backend B | Bayi kim / nerede (master data) |
| `capability-service` | 8082 | Backend B | İşlem yetkinliği + geo filtre |
| `stock-service` | 8083 | Backend A | Ürün + stok + geo |
| `api-gateway` | 8085 | Ortak | Route, CORS, rate limit |
| `frontend` | 8080 | Frontend | Harita UI |

---

## Dokümanlar

| Dosya | İçerik |
|-------|--------|
| [`docs/api-contract.md`](docs/api-contract.md) | Ortak API sözleşmesi |
| [`docs/dailies/`](docs/dailies/) | Günlük raporlar (A / B / …) |



