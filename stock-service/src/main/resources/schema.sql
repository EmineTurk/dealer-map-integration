CREATE TABLE PRODUCT (
                         ID NUMBER PRIMARY KEY,
                         NAME VARCHAR2(100) NOT NULL,
                         SKU VARCHAR2(50) NOT NULL,
                         CATEGORY VARCHAR2(50)
);

CREATE TABLE STOCK (
                       PRODUCT_ID NUMBER NOT NULL,
                       STORE_ID NUMBER NOT NULL,
                       QUANTITY NUMBER NOT NULL,

                       CONSTRAINT PK_STOCK PRIMARY KEY (PRODUCT_ID, STORE_ID),

                       CONSTRAINT FK_STOCK_PRODUCT
                           FOREIGN KEY (PRODUCT_ID)
                               REFERENCES PRODUCT(ID)
);