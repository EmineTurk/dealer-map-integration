# Bayi Harita Entegrasyonu

## Proje Özeti

İki ayrı ürün, tek ortak altyapı mantığı:

- **Pasaj — "Yakınımda Stokta":** Kullanıcı bir ürünün hangi bayide stokta olduğunu harita üzerinde görür. (Backend Stajyer A)
- **turkcell.com.tr — "Yakınımda İşlem":** Kullanıcı yapmak istediği işlemi (yeni hat, cihaz teslim, numara taşıma vb.) seçer, o işlemi yapabilen en yakın bayiyi haritada görür. (Backend Stajyer B)
- **Frontend:** Her iki modülü de içeren tek bir React uygulaması. (Frontend Stajyer)
--- 
## Project Structure

```txt
dealer-map-integration
├── stock-service
├── store-service
├── capability-service
├── frontend
└── docs
```
---

## Teknoloji Yığını


| Katman             | Teknoloji                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| Backend            | Java 17+, Spring Boot 3.x, Domain Driven Design                                                        |
| Mimari             | Microservice + Spring Cloud Gateway                                                                    |
| Veritabanı         | Oracle (Docker üzerinde `gvenzl/oracle-free` imajı önerilir)                                           |
| Cache              | Redis                                                                                                  |
| Containerization   | Docker, Docker Compose                                                                                 |
| API Dokümantasyonu | Swagger (springdoc-openapi)                                                                            |
| API Test           | Postman (collection + environment)                                                                     |
| Frontend Stack     | React 18, TypeScript, Ant Design, BEM SCSS, React Hook Form + Yup, Axios (Temel: useState + useEffect) |
| Harita Kütüphanesi | `@vis.gl/react-google-maps` (Google Maps)                                                              |
| State Yönetimi     | Local state (useState + props). **Stretch Goal:** TanStack Query                                       |


---
## Hedef Mimari
### Mimari Şema

```text
                        ┌──────────────┐
   React App  ────────▶ │ API Gateway  │
                        └──────┬───────┘
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
      ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
      │ stock-service│ │ store-service│ │capability-svc│
      │  (Pasaj, A)  │ │ (ortak, B)   │ │ (com.tr, B)  │
      └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
             │                │                │
             ▼                ▼                ▼
          Oracle           Oracle           Oracle
             │                │                │
             └────────── Redis (cache) ───────┘
            
 
```
Not: Bu mimari örnektir. Ek mikroservis gerekli görülürse eklenebilir.

### 1. store-service (Bayi Master Data — Backend B'nin sorumluluğunda, ortak kullanım)

Bu servis sistemin **tek doğruluk kaynağı (single source of truth)** olarak "bayi kimdir, nerededir" sorusunun cevabını tutar. Ne stok bilir, ne işlem yetkinliği bilir — sadece bayinin kendisini bilir.

**Veri modeli (STORE tablosu):**

- `id`, `name` (örn. "Turkcell Kadıköy TİM")
- `address`, `city`, `district`
- `latitude`, `longitude` (harita pinlerinin kaynağı)
- `type` (TIM / FRANCHISE — faz ayrımı için kritik: gerçek hayatta önce TİM'lerle başlanır)
- Opsiyonel: `phone`, `workingHours`

**Örnek endpoint'ler:**

- `GET /stores/{id}` → tek bayi detayı
- `GET /stores?ids=1,5,9` → toplu sorgu (diğer iki servisin en çok kullanacağı endpoint — stock-service "şu ID'li bayilerin detayını ver" diye buraya gelir)
- `GET /stores?city=Istanbul&district=Kadikoy` → bölgesel listeleme

**Neden "shared bounded context" örneği?** DDD'de her bounded context kendi domain'ine sahiptir, ama "bayi" kavramı hem Pasaj'ın hem [com.tr](http://com.tr)'nin dünyasında geçiyor. Bunu iki serviste ayrı ayrı kopyalamak yerine tek serviste toplayıp ikisine de sunuyoruz. Stajyerlere anlatılacak ders şu: **stock-service ve capability-service bayinin sadece ID'sini tutar, detayını asla kopyalamaz** — detay lazım olduğunda store-service'e sorar. Bu, "veriyi sahibinden iste, çoğaltma" prensibinin somut hali.

### 2. stock-service (Pasaj — Backend A'nın servisi)

Pasaj modülünün kalbi. Cevapladığı tek soru: **"Bu ürün hangi bayide, ne kadar var?"**

**Veri modeli:**

- `PRODUCT` tablosu: `id`, `name`, `sku`, `category` (örn. "iPhone 15 128GB")
- `STOCK` tablosu: `product_id`, `store_id`, `quantity` — dikkat: `store_id` sadece bir referans, bayi detayı burada YOK.

**Domain modelleme (DDD'nin öğretileceği yer):**

- `Stock` bir **aggregate**: productId + storeId + quantity üçlüsü.
- `StockLevel` bir **value object**: quantity'yi ham sayı olarak dışarı vermek yerine domain kuralıyla `IN_STOCK` (>5), `LOW` (1-5), `OUT_OF_STOCK` (0) gibi anlamlı bir duruma çevirir. Eşik mantığı controller'da değil **domain katmanında** yaşar — stajyerin "iş kuralı nereye yazılır" sorusunun cevabı bu sınıf. (Ayrıca gerçek hayatta bayiye "3 adet kaldı" yerine "az kaldı" göstermek ticari olarak da doğru tercih — rakip fiyat botlarına adet sızdırmazsın.)

**Ana endpoint:**

- `GET /products/{id}/stores?lat=41.02&lng=29.01&radius=10` → Akışı şöyle işler:
    1. STOCK tablosundan ürünün stoklu olduğu `store_id`'leri bul
    2. store-service'e `GET /stores?ids=...` ile git, bayi detaylarını (koordinat dahil) al
    3. Haversine ile kullanıcı konumuna mesafeyi hesapla, yarıçap dışını ele
    4. Mesafeye göre sıralı, StockLevel'lı sonuç dön

Bu tek endpoint, projenin öğretmek istediği neredeyse her şeyi içeriyor: servisler arası çağrı, domain kuralı, geo hesap, Redis cache (bu sorgu cache'lenen sorgu) ve DTO tasarımı.

### 3. capability-service ([turkcell.com.tr](http://turkcell.com.tr) — Backend B'nin servisi)

[com.tr](http://com.tr) modülünün kalbi. Cevapladığı soru: **"Bu işlemi hangi bayi yapabiliyor?"** — stock-service'in birebir simetriği, ama stok yerine yetkinlik tutar.

**Veri modeli (STORE_CAPABILITY tablosu):**

- `store_id`, `capability_type`
- `capability_type` bir enum: `NEW_LINE` (yeni hat), `DEVICE_DELIVERY` (cihaz teslim), `DEVICE_REPAIR` (tamir kabul), `NUMBER_PORT` (numara taşıma), `BILL_PAYMENT` (fatura ödeme)...
- Bir bayinin birden çok yetkinliği olur (many-to-many'nin bağlantı tablosu gibi düşün).

**Ana endpoint:**

- `GET /capabilities/DEVICE_REPAIR/stores?lat=..&lng=..&radius=..` → akış stock-service'inkiyle aynı iskelette: yetkin bayi ID'lerini bul → store-service'ten detayları çek → mesafe hesapla → sırala.

**Stok'tan önemli bir farkı var, bu da öğretici:** stok verisi dakikalar içinde değişir (cache TTL 5 dk), yetkinlik verisi ise neredeyse statiktir — bir bayi bugün tamir kabul ediyorsa yarın da eder (cache TTL 1 saat+). Stajyerler aynı cache mekanizmasını iki farklı veri karakteriyle kullanınca "TTL kararı veriye göre verilir" dersini kendiliğinden alıyor.



