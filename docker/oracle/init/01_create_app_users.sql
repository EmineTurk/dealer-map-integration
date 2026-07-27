-- Shared local-development users for the single turkcell-oracle instance.
-- This script runs only during the first initialization of oracle-data.

ALTER SESSION SET CONTAINER = FREEPDB1;

CREATE USER store_app IDENTIFIED BY StoreApp123;
GRANT CREATE SESSION, CREATE TABLE, CREATE SEQUENCE TO store_app;
ALTER USER store_app QUOTA UNLIMITED ON USERS;

CREATE USER stock_app IDENTIFIED BY StockApp123;
GRANT CREATE SESSION, CREATE TABLE, CREATE SEQUENCE TO stock_app;
ALTER USER stock_app QUOTA UNLIMITED ON USERS;
