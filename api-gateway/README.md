# API Gateway (Day 13)

Spring Cloud Gateway — frontend için tek giriş noktası.
Bu modül projedeki tek Gateway uygulamasıdır; Backend A ve Backend B trafiği
aynı giriş noktasından yönetilir.

## Teknoloji sürümleri

- Java 17 veya 21
- Spring Boot 3.5.16
- Spring Cloud 2025.0.3
- Spring Cloud Gateway 4.3.5

Bu sürümler eski Gateway 4.1.x hattındaki güvenlik açıklarını gidermek için
birlikte, Spring'in resmî uyumluluk matrisine göre kullanılmaktadır.

## Port

`8085`

## Route'lar

| Frontend path | Downstream | Örnek |
|---------------|------------|--------|
| `/api/pasaj/**` | stock-service `:8080` (StripPrefix=2) | `GET /api/pasaj/products` → `/products` |
| `/api/stores/**` | store-service `:8081` (StripPrefix=1) | `GET /api/stores/1` → `/stores/1` |
| `/api/comtr/**` | capability-service `:8082` (StripPrefix=2) | `GET /api/comtr/capabilities/types` → `/capabilities/types` |

## CORS

CORS yalnızca gateway'de tanımlıdır (`app.cors.allowed-origins`).  
Stock, store ve capability servislerinde ayrıca CORS tanımı tutulmaz.

## Ortak teknik özellikler

- Gelen `X-Correlation-Id` değerini devam ettirir; yoksa yeni bir değer üretir.
- Method, path, status, correlation ID ve süre bilgilerini merkezi olarak loglar.
- Stock Service bağlantısında connect ve response timeout uygular.
- Stok güncelleme `PUT` route'unu istemci IP'sine göre Redis ile sınırlar.
- Actuator üzerinden yalnızca `health` ve `info` endpoint'lerini açar.

## Çalıştırma

Önkoşul: Redis ile `stock-service` (8080), `store-service` (8081) ve
`capability-service` (8082) ayakta olmalıdır.

```bash
cd api-gateway
mvnw.cmd spring-boot:run
```

Health: http://localhost:8085/actuator/health

## Örnek istekler

```http
GET http://localhost:8085/api/stores/1
GET http://localhost:8085/api/comtr/capabilities/DEVICE_REPAIR/stores?lat=41.02&lng=29.01&radius=10
GET http://localhost:8085/api/pasaj/products
PUT http://localhost:8085/api/pasaj/products/1/stores/1/stock
```

## Yapılandırma

| Değişken | Varsayılan |
|---|---|
| `GATEWAY_PORT` | `8085` |
| `STOCK_SERVICE_URI` | `http://localhost:8080` |
| `STORE_SERVICE_URI` | `http://localhost:8081` |
| `CAPABILITY_SERVICE_URI` | `http://localhost:8082` |
| `FRONTEND_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` |
| `GATEWAY_CONNECT_TIMEOUT_MS` | `2000` |
| `GATEWAY_RESPONSE_TIMEOUT` | `5s` |
| `REDIS_HOST` / `REDIS_PORT` | `localhost` / `6379` |
| `STOCK_WRITE_RATE_PER_SECOND` | `5` |
| `STOCK_WRITE_BURST_CAPACITY` | `10` |
| `TRUSTED_PROXY_COUNT` | `0` |

Local geliştirmede `TRUSTED_PROXY_COUNT=0` bırakılır ve doğrudan bağlantı IP'si
kullanılır. Gateway güvenilir bir reverse proxy arkasına alındığında değer,
Gateway'in önündeki güvenilir proxy sayısına ayarlanır.

Servisler arası çağrılar (capability → store) doğrudan `localhost:8081` üzerinden devam eder; gateway'e zorunlu değildir.
