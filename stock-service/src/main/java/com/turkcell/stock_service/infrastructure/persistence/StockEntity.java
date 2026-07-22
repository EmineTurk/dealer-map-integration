package com.turkcell.stock_service.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

@Entity
@Table(name = "STOCK")
@IdClass(StockEntityId.class)
public class StockEntity {

    @Id
    @Column(name = "PRODUCT_ID", nullable = false)
    private Long productId;

    @Id
    @Column(name = "STORE_ID", nullable = false)
    private Long storeId;

    @Column(name = "QUANTITY", nullable = false)
    private Integer quantity;

    protected StockEntity() {
    }

    public Long getProductId() {
        return productId;
    }

    public Long getStoreId() {
        return storeId;
    }

    public Integer getQuantity() {
        return quantity;
    }

}
