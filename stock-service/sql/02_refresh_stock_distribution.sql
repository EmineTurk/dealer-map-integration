-- Ürünlerin bulunabildiği mağaza sayısı popülerliğe göre 17 ile 58 arasında değişir.
-- Stok durumu ve miktarı, gerçekçi fakat tekrar üretilebilir sözde-rastgele bir
-- formülle üretilir. Böylece proje seed'i ile frontend mock verisi aynı kalır.

ALTER SESSION SET CONTAINER = FREEPDB1;
ALTER SESSION SET CURRENT_SCHEMA = stock_app;

DELETE FROM STOCK;

INSERT INTO STOCK (PRODUCT_ID, STORE_ID, QUANTITY)
WITH product_distribution (product_id, store_count) AS (
    SELECT 1, 58 FROM DUAL UNION ALL
    SELECT 2, 48 FROM DUAL UNION ALL
    SELECT 3, 52 FROM DUAL UNION ALL
    SELECT 4, 35 FROM DUAL UNION ALL
    SELECT 5, 28 FROM DUAL UNION ALL
    SELECT 6, 34 FROM DUAL UNION ALL
    SELECT 7, 42 FROM DUAL UNION ALL
    SELECT 8, 31 FROM DUAL UNION ALL
    SELECT 9, 44 FROM DUAL UNION ALL
    SELECT 10, 26 FROM DUAL UNION ALL
    SELECT 11, 18 FROM DUAL UNION ALL
    SELECT 12, 22 FROM DUAL UNION ALL
    SELECT 13, 37 FROM DUAL UNION ALL
    SELECT 14, 29 FROM DUAL UNION ALL
    SELECT 15, 46 FROM DUAL UNION ALL
    SELECT 16, 24 FROM DUAL UNION ALL
    SELECT 17, 33 FROM DUAL UNION ALL
    SELECT 18, 39 FROM DUAL UNION ALL
    SELECT 19, 17 FROM DUAL UNION ALL
    SELECT 20, 21 FROM DUAL
),
generated_rows AS (
    SELECT
        distribution.product_id,
        slots.slot_no,
        MOD(distribution.product_id * 29 + slots.slot_no * 37, 100) + 1 AS store_id
    FROM product_distribution distribution
    CROSS JOIN (
        SELECT LEVEL AS slot_no
        FROM DUAL
        CONNECT BY LEVEL <= 58
    ) slots
    WHERE slots.slot_no <= distribution.store_count
),
scored_rows AS (
    SELECT
        product_id,
        store_id,
        slot_no,
        MOD(product_id * 41 + store_id * 17 + slot_no * 13, 100) AS stock_score
    FROM generated_rows
)
SELECT
    product_id,
    store_id,
    CASE
        WHEN stock_score < 11 THEN 0
        WHEN stock_score < 31 THEN 1 + MOD(stock_score, 5)
        ELSE 6 + MOD(product_id * 7 + store_id * 3 + slot_no * 11, 45)
    END AS quantity
FROM scored_rows;

COMMIT;
