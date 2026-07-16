package com.turkcell.stock_service.entity;

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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StockId)) return false;
        StockId stockId = (StockId) o;
        return Objects.equals(productId, stockId.productId)
                && Objects.equals(storeId, stockId.storeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productId, storeId);
    }
}