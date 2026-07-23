package com.turkcell.stock_service.application.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StockUpdateRequest(
        @NotNull(message = "Quantity is required")
        @Min(value = 0, message = "Quantity must be zero or greater")
        Integer quantity
) {
}
