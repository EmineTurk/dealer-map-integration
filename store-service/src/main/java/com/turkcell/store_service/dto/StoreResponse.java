package com.turkcell.store_service.dto;

import com.turkcell.store_service.domain.StoreType;

public record StoreResponse(
		Long id,
		String name,
		String address,
		String city,
		String district,
		double latitude,
		double longitude,
		StoreType type
) {
}
