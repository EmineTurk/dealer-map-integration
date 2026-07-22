package com.turkcell.stock_service.domain.model;

public record Product(
        Long id,
        String name,
        String sku,
        String category
) {
    public Product {
        if (id == null) {
            throw new IllegalArgumentException("product id cannot be null");
        }

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("product name cannot be blank");
        }

        if (sku == null || sku.isBlank()) {
            throw new IllegalArgumentException("product sku cannot be blank");
        }

        if (category == null || category.isBlank()) {
            throw new IllegalArgumentException("product category cannot be blank");
        }
    }
}
