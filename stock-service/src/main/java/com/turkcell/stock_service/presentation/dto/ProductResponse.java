package com.turkcell.stock_service.presentation.dto;

public record ProductResponse(
        Long id,
        String name,
        String sku,
        String category
) {
}
