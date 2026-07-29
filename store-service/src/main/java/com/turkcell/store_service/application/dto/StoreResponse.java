package com.turkcell.store_service.application.dto;

import com.turkcell.store_service.domain.model.Store;
import com.turkcell.store_service.domain.service.GoogleMapsDeepLink;

/**
 * Matches API contract {@code Store} type, plus Day-7 filter fields
 * ({@code status}, {@code opensWeekend}) and Day-12 {@code directionsUrl}.
 * Domain enums are mapped to String so the DTO does not depend on domain types.
 */
public record StoreResponse(
		Long id,
		String name,
		String address,
		String city,
		String district,
		double latitude,
		double longitude,
		String type,
		String phone,
		String workingHours,
		String status,
		boolean opensWeekend,
		String directionsUrl
) {
	public static StoreResponse from(Store store) {
		return new StoreResponse(
				store.getId(),
				store.getName(),
				store.getAddress(),
				store.getCity(),
				store.getDistrict(),
				store.getLatitude(),
				store.getLongitude(),
				store.getType() == null ? null : store.getType().name(),
				store.getPhone(),
				store.getWorkingHours(),
				store.getStatus() == null ? null : store.getStatus().name(),
				store.isOpensWeekend(),
				GoogleMapsDeepLink.forCoordinates(store.getLatitude(), store.getLongitude()));
	}
}
