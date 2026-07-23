package com.turkcell.stock_service.domain.model;

public final class Stock {

    private final Long productId;
    private final Long storeId;
    private final int quantity;

    public Stock(Long productId, Long storeId, Integer quantity) {
        if (productId == null) {
            throw new IllegalArgumentException("product id cannot be null");
        }

        if (storeId == null) {
            throw new IllegalArgumentException("store id cannot be null");
        }

        if (quantity == null) {
            throw new IllegalArgumentException("quantity cannot be null");
        }

        if (quantity < 0) {
            throw new IllegalArgumentException("quantity cannot be negative");
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

    public int getQuantity() {
        return quantity;
    }
}
