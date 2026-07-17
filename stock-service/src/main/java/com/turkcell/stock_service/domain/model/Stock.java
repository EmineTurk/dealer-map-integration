package com.turkcell.stock_service.domain.model;

public class Stock {

    private final Long productId;
    private final Long storeId;
    private final Integer quantity;

    public Stock(Long productId, Long storeId, Integer quantity) {
        if (productId == null) {
            throw new IllegalArgumentException("productId boş olamaz");
        }

        if (storeId == null) {
            throw new IllegalArgumentException("storeId boş olamaz");
        }

        if (quantity == null) {
            throw new IllegalArgumentException("quantity boş olamaz");
        }

        if (quantity < 0) {
            throw new IllegalArgumentException("quantity negatif olamaz");
        }

        this.productId = productId;
        this.storeId = storeId;
        this.quantity = quantity;
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

    public StockLevel getStockLevel() {
        return StockLevel.fromQuantity(quantity);
    }
}
