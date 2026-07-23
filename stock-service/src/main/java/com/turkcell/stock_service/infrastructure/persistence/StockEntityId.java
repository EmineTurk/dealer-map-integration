package com.turkcell.stock_service.infrastructure.persistence;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

public class StockEntityId implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long productId;
    private Long storeId;

    @SuppressWarnings("unused") // Required by JPA for reflective construction.
    public StockEntityId() {
    }

    public StockEntityId(Long productId, Long storeId) {
        this.productId = productId;
        this.storeId = storeId;
    }

    @Override
    public boolean equals(Object object) {
        if (this == object) {
            return true;
        }

        if (!(object instanceof StockEntityId stockEntityId)) {
            return false;
        }

        return Objects.equals(productId, stockEntityId.productId)
                && Objects.equals(storeId, stockEntityId.storeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productId, storeId);
    }
}
