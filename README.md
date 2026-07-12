# Bayi Harita Entegrasyonu

## Proje Özeti

İki ayrı ürün, tek ortak altyapı mantığı:

- **Pasaj - "Yakınımda Stokta":** Kullanıcı bir ürünün hangi bayide stokta olduğunu harita üzerinde görür. (Backend Stajyer A)
- **turkcell.com.tr - "Yakınımda İşlem":** Kullanıcı yapmak istediği işlemi (yeni hat, cihaz teslim, numara taşıma vb.) seçer, o işlemi yapabilen en yakın bayiyi haritada görür. (Backend Stajyer B)
- **Frontend:** Her iki modülü de içeren tek bir React uygulaması. (Frontend Stajyer)
--- 
## Project Structure

```txt
dealer-map-integration
├── docker-compose.yml   (Oracle Free — Gün 3)
├── stock-service        (port 8080 — Pasaj / Backend A)
├── store-service        (port 8081 — Bayi master data / Backend B)
├── capability-service   (Hafta 2 — Backend B)
├── frontend
└── docs
```

## Local Oracle (Day 3)

```bash
docker compose up -d oracle
```

- Port: `1521` / Service: `FREEPDB1`
- App user: `store_app` / `StoreApp123`
- `STORE` DDL: `store-service/sql/01_create_store_table.sql`
- API contract: [`docs/api-contract.md`](docs/api-contract.md)
