package com.turkcell.stock_service.infrastructure.persistence;

import java.io.Serializable;
import java.util.Objects;

public class StockId implements Serializable {

    private Long productId;
    private Long storeId;

    public StockId() {
    }

    public StockId(Long productId, Long storeId) {
        this.productId = productId;
        this.storeId = storeId;
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

    @Override
    public boolean equals(Object object) {
        if (this == object) {
            return true;
        }

        if (!(object instanceof StockId stockId)) {
            return false;
        }

        return Objects.equals(productId, stockId.productId)
                && Objects.equals(storeId, stockId.storeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productId, storeId);
    }
}