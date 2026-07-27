# store-service — Oracle SQL

## Bağlantı bilgileri

| Alan | Değer |
|------|--------|
| Host | `localhost` |
| Port | `1521` |
| Service name | `FREEPDB1` |
| User | `store_app` |
| Password | `StoreApp123` |

JDBC URL:

```text
jdbc:oracle:thin:@//localhost:1521/FREEPDB1
```

## Script'ler

| Dosya | Ne yapar |
|-------|----------|
| `01_create_store_table.sql` | STORE + status/opens_weekend |
| `02_alter_store_day7_columns.sql` | Eski volume için ALTER (kolon yoksa ekler) |
| `03_create_store_capability.sql` | STORE_CAPABILITY (capability-service) |

> Seed: Spring `StoreDataLoader` / `CapabilityDataLoader` tablo boşsa doldurur.

Bu dosyalar kök `docker-compose.yml` tarafından tek `turkcell-oracle`
container'ının ilk volume kurulumunda çalıştırılır. Aynı Oracle instance'ında
`stock_app` şeması da `stock-service/sql/` dosyalarıyla hazırlanır.

## DBeaver

1. `docker compose up -d oracle`
2. Service name = `FREEPDB1`, user = `store_app`
3. `SELECT COUNT(*) FROM store;`
4. `SELECT COUNT(*) FROM store_capability;`
