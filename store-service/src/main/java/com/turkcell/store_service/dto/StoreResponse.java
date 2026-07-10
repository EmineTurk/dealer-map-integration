package com.turkcell.store_service.dto;

import com.turkcell.store_service.domain.StoreType;

/**
 * Matches API contract {@code Store} type.
 * Field names are camelCase; serialized as-is by Jackson.
 */
public record StoreResponse(
		Long id,
		String name,
		String address,
		String city,
		String district,
		double latitude,
		double longitude,
		StoreType type,
		String phone,
		String workingHours
) {
}
