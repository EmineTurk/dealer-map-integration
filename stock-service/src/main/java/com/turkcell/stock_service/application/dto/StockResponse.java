package com.turkcell.stock_service.application.dto;

import com.turkcell.stock_service.domain.model.StockLevel;

public record StockResponse(
        Long productId,
        Long storeId,
        StockLevel stockLevel
) {
}