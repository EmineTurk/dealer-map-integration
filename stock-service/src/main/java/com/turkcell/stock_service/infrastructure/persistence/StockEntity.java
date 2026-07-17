package com.turkcell.stock_service.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

@Entity
@Table(name = "STOCK")
@IdClass(StockId.class)
public class StockEntity {

    @Id
    @Column(name = "PRODUCT_ID", nullable = false)
    private Long productId;

    @Id
    @Column(name = "STORE_ID", nullable = false)
    private Long storeId;

    @Column(name = "QUANTITY", nullable = false)
    private Integer quantity;

    public StockEntity() {
    }

    public StockEntity(Long productId, Long storeId, Integer quantity) {
        this.productId = productId;
        this.storeId = storeId;
        this.quantity = quantity;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Long getStoreId() {
        return storeId;
    }

    public void setStoreId(Long storeId) {
        this.storeId = storeId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}