package com.turkcell.store_service.application.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.turkcell.store_service.application.dto.StoreResponse;
import com.turkcell.store_service.domain.exception.StoreNotFoundException;
import com.turkcell.store_service.domain.model.StoreStatus;
import com.turkcell.store_service.infrastructure.persistence.StoreEntity;
import com.turkcell.store_service.infrastructure.persistence.StoreJpaRepository;
import com.turkcell.store_service.infrastructure.persistence.StoreMapper;
import com.turkcell.store_service.util.CacheKeys;
import com.turkcell.store_service.util.ParseUtils;

@Service
public class StoreApplicationService {

	private final StoreJpaRepository storeRepository;
	private final StoreMapper storeMapper;
	/** Proxy self so {@code @Cacheable} applies when routing delegates internally. */
	private final StoreApplicationService self;

	public StoreApplicationService(
			StoreJpaRepository storeRepository,
			StoreMapper storeMapper,
			@Lazy StoreApplicationService self) {
		this.storeRepository = storeRepository;
		this.storeMapper = storeMapper;
		this.self = self;
	}

	/**
	 * Routes list queries: ids → bulk lookup; city/district → region; else all.
	 */
	public List<StoreResponse> getStores(String ids, String city, String district) {
		if (ids != null && !ids.isBlank()) {
			return self.getStoresByIds(ParseUtils.parseIds(ids));
		}
		if ((city != null && !city.isBlank()) || (district != null && !district.isBlank())) {
			return self.getStoresByRegion(city, district);
		}
		return self.getAllStores();
	}

	@Transactional(readOnly = true)
	@Cacheable(cacheNames = "stores-all")
	public List<StoreResponse> getAllStores() {
		return toStoreResponseList(storeRepository.findAll());
	}

	@Transactional(readOnly = true)
	@Cacheable(cacheNames = "store-by-id", key = "#id")
	public StoreResponse getStoreById(Long id) {
		return storeRepository.findById(id)
				.map(storeMapper::toDomain)
				.map(StoreResponse::from)
				.orElseThrow(() -> new StoreNotFoundException(id));
	}

	/**
	 * Bulk lookup for stock-service / capability-service.
	 * Missing IDs are silently skipped (callers already know their IDs).
	 */
	@Transactional(readOnly = true)
	@Cacheable(
			cacheNames = "stores-by-ids",
			key = "T(com.turkcell.store_service.util.CacheKeys).sortedIds(#ids)")
	public List<StoreResponse> getStoresByIds(List<Long> ids) {
		if (ids == null || ids.isEmpty()) {
			return List.of();
		}
		return toStoreResponseList(storeRepository.findByIdIn(ids));
	}

	@Transactional(readOnly = true)
	@Cacheable(cacheNames = "stores-by-region", key = "{#city, #district}")
	public List<StoreResponse> getStoresByRegion(String city, String district) {
		if (city != null && !city.isBlank() && district != null && !district.isBlank()) {
			return toStoreResponseList(
					storeRepository.findByCityIgnoreCaseAndDistrictIgnoreCase(city.trim(), district.trim()));
		}
		if (city != null && !city.isBlank()) {
			return toStoreResponseList(storeRepository.findByCityIgnoreCase(city.trim()));
		}
		return self.getAllStores();
	}

	/**
	 * Updates store status and clears all store caches so list/detail queries stay fresh.
	 */
	@Transactional
	@CacheEvict(cacheNames = {
			"stores-all",
			"store-by-id",
			"stores-by-ids",
			"stores-by-region"
	}, allEntries = true)
	public StoreResponse updateStoreStatus(Long id, String statusValue) {
		StoreEntity entity = storeRepository.findById(id)
				.orElseThrow(() -> new StoreNotFoundException(id));
		entity.setStatus(parseStatus(statusValue));
		return StoreResponse.from(storeMapper.toDomain(storeRepository.save(entity)));
	}

	private static StoreStatus parseStatus(String statusValue) {
		if (statusValue == null || statusValue.isBlank()) {
			throw new IllegalArgumentException("status zorunludur");
		}
		try {
			return StoreStatus.valueOf(statusValue.trim().toUpperCase(Locale.ROOT));
		} catch (IllegalArgumentException ex) {
			throw new IllegalArgumentException(
					"Geçersiz status: " + statusValue + " (beklenen: ACTIVE, INACTIVE)");
		}
	}

	private List<StoreResponse> toStoreResponseList(List<StoreEntity> entities) {
		return entities.stream()
				.map(storeMapper::toDomain)
				.map(StoreResponse::from)
				.collect(Collectors.toCollection(ArrayList::new));
	}

	/** Exposed for SpEL / tests; prefer {@link CacheKeys#sortedIds}. */
	public static String normalizeIdsKey(List<Long> ids) {
		return CacheKeys.sortedIds(ids);
	}
}
