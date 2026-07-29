package com.turkcell.capability_service.application.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.turkcell.capability_service.application.dto.CapabilityTypeOption;
import com.turkcell.capability_service.application.dto.StoreCapabilityResult;
import com.turkcell.capability_service.domain.exception.CapabilityTypeNotFoundException;
import com.turkcell.capability_service.domain.model.CapabilityType;
import com.turkcell.capability_service.domain.service.DistanceCalculator;
import com.turkcell.capability_service.domain.service.GoogleMapsDeepLink;
import com.turkcell.capability_service.infrastructure.client.StoreDto;
import com.turkcell.capability_service.infrastructure.client.StoreServiceClient;

/**
 * Orchestrates capability queries: DB lookup (transactional) then HTTP to store-service
 * outside any transaction so the connection pool is not held during remote calls.
 */
@Service
public class CapabilityApplicationService {

	private final CapabilityPersistenceService persistenceService;
	private final StoreServiceClient storeServiceClient;
	private final DistanceCalculator distanceCalculator;

	public CapabilityApplicationService(
			CapabilityPersistenceService persistenceService,
			StoreServiceClient storeServiceClient,
			DistanceCalculator distanceCalculator) {
		this.persistenceService = persistenceService;
		this.storeServiceClient = storeServiceClient;
		this.distanceCalculator = distanceCalculator;
	}

	@Cacheable(cacheNames = "capability-types")
	public List<CapabilityTypeOption> getCapabilityTypes() {
		return Arrays.stream(CapabilityType.values())
				.map(CapabilityTypeOption::from)
				.collect(Collectors.toCollection(ArrayList::new));
	}

	/**
	 * GET /capabilities/{type}/stores?lat=&lng=&radius=&workingHours=&status=
	 */
	@Cacheable(
			cacheNames = "capability-store-search",
			key = "{#typeKey, #lat, #lng, #radius, #workingHours, #status}")
	public List<StoreCapabilityResult> findStoresByCapability(
			String typeKey,
			double lat,
			double lng,
			double radius,
			String workingHours,
			String status) {
		CapabilityType type = requireType(typeKey);

		// 1) DB — short transactional scope (no HTTP inside)
		List<Long> storeIds = persistenceService.findStoreIdsByCapabilityType(type);
		if (storeIds.isEmpty()) {
			return List.of();
		}

		// 2) HTTP — outside @Transactional so pool connections are released
		List<StoreDto> stores = storeServiceClient.getStoresByIds(storeIds);

		boolean weekendOnly = workingHours != null
				&& workingHours.trim().equalsIgnoreCase("weekend");
		String statusFilter = status == null || status.isBlank()
				? null
				: status.trim().toUpperCase(Locale.ROOT);

		return stores.stream()
				.filter(store -> matchesStatus(store, statusFilter))
				.filter(store -> matchesWeekend(store, weekendOnly))
				.map(store -> {
					double distance = distanceCalculator.calculate(
							lat, lng, store.latitude(), store.longitude());
					return toResult(store, distance);
				})
				.filter(result -> result.distance() <= radius)
				.sorted(Comparator.comparingDouble(StoreCapabilityResult::distance))
				.collect(Collectors.toCollection(ArrayList::new));
	}

	@CacheEvict(cacheNames = {"capability-types", "capability-store-search"}, allEntries = true)
	public void assignCapability(String typeKey, Long storeId) {
		CapabilityType type = requireType(typeKey);
		persistenceService.assignCapability(storeId, type);
	}

	@CacheEvict(cacheNames = {"capability-types", "capability-store-search"}, allEntries = true)
	public void removeCapability(String typeKey, Long storeId) {
		CapabilityType type = requireType(typeKey);
		persistenceService.removeCapability(storeId, type);
	}

	private static CapabilityType requireType(String typeKey) {
		CapabilityType type = CapabilityType.fromKey(typeKey);
		if (type == null) {
			throw new CapabilityTypeNotFoundException(typeKey);
		}
		return type;
	}

	private static boolean matchesStatus(StoreDto store, String statusFilter) {
		if (statusFilter == null) {
			return true;
		}
		String storeStatus = store.status() == null ? "ACTIVE" : store.status();
		return statusFilter.equalsIgnoreCase(storeStatus);
	}

	private static boolean matchesWeekend(StoreDto store, boolean weekendOnly) {
		if (!weekendOnly) {
			return true;
		}
		return Boolean.TRUE.equals(store.opensWeekend());
	}

	private static StoreCapabilityResult toResult(StoreDto store, double distance) {
		return new StoreCapabilityResult(
				store.id(),
				store.name(),
				store.address(),
				store.city(),
				store.district(),
				store.latitude(),
				store.longitude(),
				store.type(),
				store.phone(),
				store.workingHours(),
				distance,
				GoogleMapsDeepLink.forCoordinates(store.latitude(), store.longitude()));
	}
}
