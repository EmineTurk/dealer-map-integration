CREATE TABLE PRODUCT (
                         ID NUMBER(19) PRIMARY KEY,
                         NAME VARCHAR2(100) NOT NULL,
                         SKU VARCHAR2(50) NOT NULL,
                         CATEGORY VARCHAR2(50) NOT NULL,

                         CONSTRAINT UK_PRODUCT_SKU UNIQUE (SKU)
);

CREATE TABLE STOCK (
                       PRODUCT_ID NUMBER(19) NOT NULL,
                       STORE_ID NUMBER(19) NOT NULL,
                       QUANTITY NUMBER(10) NOT NULL,

                       CONSTRAINT PK_STOCK PRIMARY KEY (PRODUCT_ID, STORE_ID),

                       CONSTRAINT CK_STOCK_QUANTITY_NON_NEGATIVE
                           CHECK (QUANTITY >= 0),

                       CONSTRAINT FK_STOCK_PRODUCT
                           FOREIGN KEY (PRODUCT_ID)
                               REFERENCES PRODUCT(ID)
);
