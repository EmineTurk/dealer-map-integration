package com.turkcell.stock_service.infrastructure.client.dto;

import com.turkcell.stock_service.domain.model.StoreType;

public record StoreClientResponse(
        Long id,
        String name,
        String address,
        String city,
        String district,
        Double latitude,
        Double longitude,
        StoreType type,
        String phone,
        String workingHours
) {
}
