package com.turkcell.stock_service.domain.model;

public enum StockLevel {

    OUT_OF_STOCK,
    LOW,
    IN_STOCK;

    public static StockLevel fromQuantity(int quantity) {
        if (quantity < 0) {
            throw new IllegalArgumentException("quantity negatif olamaz");
        }

        if (quantity == 0) {
            return OUT_OF_STOCK;
        }

        if (quantity <= 5) {
            return LOW;
        }

        return IN_STOCK;
    }
}