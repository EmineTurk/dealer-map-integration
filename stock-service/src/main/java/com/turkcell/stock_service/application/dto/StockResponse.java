package com.turkcell.stock_service.application.dto;

import com.turkcell.stock_service.domain.model.StockLevel;
import com.turkcell.stock_service.domain.model.StoreType;

public record StockResponse(
        Long id,
        String name,
        String address,
        String city,
        String district,
        double latitude,
        double longitude,
        StoreType type,
        String phone,
        String workingHours,
        double distance,
        StockLevel stockLevel
) {
}
