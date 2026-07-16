package com.turkcell.stock_service.application.dto;

public record ProductResponse(
        Long id,
        String name,
        String sku,
        String category
) {
}
