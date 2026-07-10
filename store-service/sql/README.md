# store-service — Oracle SQL

## Bağlantı bilgileri

| Alan | Değer |
|------|--------|
| Host | `localhost` |
| Port | `1521` |
| Service name | `FREEPDB1` |
| User | `store_app` |
| Password | `StoreApp123` |
| SYS password | `OraclePassword123` (sadece admin) |

JDBC URL (Gün 4 için):

```text
jdbc:oracle:thin:@localhost:1521/FREEPDB1
```

## Script'ler

| Dosya | Ne yapar |
|-------|----------|
| `01_create_store_table.sql` | `STORE` tablosu + index + check constraint |

## DBeaver ile bağlanma

1. `docker compose up -d oracle` ile container'ın healthy olmasını bekle.
2. DBeaver → New Connection → Oracle.
3. Connection type: **Service name** = `FREEPDB1`.
4. User/password: `store_app` / `StoreApp123`.
5. SQL Editor'da `01_create_store_table.sql` çalıştır (init volume ile zaten oluşmuş olabilir).

Tablo var mı kontrol:

```sql
SELECT table_name FROM user_tables WHERE table_name = 'STORE';
SELECT column_name, data_type, nullable FROM user_tab_columns WHERE table_name = 'STORE' ORDER BY column_id;
```
