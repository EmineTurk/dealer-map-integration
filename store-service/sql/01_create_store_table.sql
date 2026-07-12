-- STORE: bayi master data (store-service bounded context)
-- gvenzl/oracle-free init script'leri SYS olarak CDB$ROOT'ta başlar.
-- Bu yüzden önce PDB'ye geçip APP_USER (store_app) şemasında tablo oluşturuyoruz.
--
-- Manuel (DBeaver): store_app / StoreApp123 @ FREEPDB1 ile bağlanıp
-- CREATE TABLE store (...); şeklinde de çalıştırılabilir (şema öneki gerekmez).

ALTER SESSION SET CONTAINER = FREEPDB1;

CREATE TABLE store_app.store (
    id              NUMBER(19)       NOT NULL,
    name            VARCHAR2(150)    NOT NULL,
    address         VARCHAR2(255)    NOT NULL,
    city            VARCHAR2(80)     NOT NULL,
    district        VARCHAR2(80)     NOT NULL,
    latitude        NUMBER(10, 7)    NOT NULL,
    longitude       NUMBER(10, 7)    NOT NULL,
    type            VARCHAR2(20)     NOT NULL,
    phone           VARCHAR2(30),
    working_hours   VARCHAR2(120),
    CONSTRAINT pk_store PRIMARY KEY (id),
    CONSTRAINT ck_store_type CHECK (type IN ('TIM', 'FRANCHISE'))
);

CREATE INDEX store_app.idx_store_city_district ON store_app.store (city, district);
CREATE INDEX store_app.idx_store_type ON store_app.store (type);

COMMENT ON TABLE store_app.store IS 'Bayi master data — single source of truth (store-service)';
COMMENT ON COLUMN store_app.store.type IS 'TIM veya FRANCHISE';
COMMENT ON COLUMN store_app.store.latitude IS 'Harita pin enlemi';
COMMENT ON COLUMN store_app.store.longitude IS 'Harita pin boylamı';
