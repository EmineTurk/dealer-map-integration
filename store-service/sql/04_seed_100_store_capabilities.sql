-- 100 mağazanın tamamına üç farklı işlem yetkinliği dağıtır.
-- Script tekrar çalıştırıldığında tabloyu aynı deterministik hale getirir.

ALTER SESSION SET CONTAINER = FREEPDB1;
ALTER SESSION SET CURRENT_SCHEMA = store_app;

DELETE FROM STORE_CAPABILITY;

INSERT INTO STORE_CAPABILITY (STORE_ID, CAPABILITY_TYPE)
SELECT store_id, 'NEW_LINE'
FROM (
    SELECT LEVEL AS store_id
    FROM DUAL
    CONNECT BY LEVEL <= 100
)
UNION ALL
SELECT
    store_id,
    CASE
        WHEN MOD(store_id, 2) = 0 THEN 'DEVICE_DELIVERY'
        ELSE 'NUMBER_PORT'
    END
FROM (
    SELECT LEVEL AS store_id
    FROM DUAL
    CONNECT BY LEVEL <= 100
)
UNION ALL
SELECT
    store_id,
    CASE
        WHEN MOD(store_id, 3) = 0 THEN 'DEVICE_REPAIR'
        ELSE 'BILL_PAYMENT'
    END
FROM (
    SELECT LEVEL AS store_id
    FROM DUAL
    CONNECT BY LEVEL <= 100
);

COMMIT;
