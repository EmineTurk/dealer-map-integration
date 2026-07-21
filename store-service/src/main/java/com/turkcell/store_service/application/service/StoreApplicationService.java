package com.turkcell.store_service.application.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.turkcell.store_service.application.dto.StoreResponse;
import com.turkcell.store_service.domain.exception.StoreNotFoundException;
import com.turkcell.store_service.infrastructure.persistence.StoreJpaRepository;
import com.turkcell.store_service.infrastructure.persistence.StoreMapper;

@Service
@Transactional(readOnly = true)
public class StoreApplicationService {

	private final StoreJpaRepository storeRepository;
	private final StoreMapper storeMapper;

	public StoreApplicationService(StoreJpaRepository storeRepository, StoreMapper storeMapper) {
		this.storeRepository = storeRepository;
		this.storeMapper = storeMapper;
	}

	@Cacheable(cacheNames = "stores-all")
	public List<StoreResponse> getAllStores() {
		return storeRepository.findAll().stream()
				.map(storeMapper::toDomain)
				.map(StoreResponse::from)
				.collect(Collectors.toCollection(ArrayList::new));
	}

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
	@Cacheable(cacheNames = "stores-by-ids", key = "#ids")
	public List<StoreResponse> getStoresByIds(List<Long> ids) {
		if (ids == null || ids.isEmpty()) {
			return List.of();
		}
		return storeRepository.findByIdIn(ids).stream()
				.map(storeMapper::toDomain)
				.map(StoreResponse::from)
				.collect(Collectors.toCollection(ArrayList::new));
	}

	@Cacheable(cacheNames = "stores-by-region", key = "{#city, #district}")
	public List<StoreResponse> getStoresByRegion(String city, String district) {
		List<StoreResponse> stores;
		if (city != null && !city.isBlank() && district != null && !district.isBlank()) {
			stores = storeRepository.findByCityIgnoreCaseAndDistrictIgnoreCase(city.trim(), district.trim()).stream()
					.map(storeMapper::toDomain)
					.map(StoreResponse::from)
					.collect(Collectors.toCollection(ArrayList::new));
		} else if (city != null && !city.isBlank()) {
			stores = storeRepository.findByCityIgnoreCase(city.trim()).stream()
					.map(storeMapper::toDomain)
					.map(StoreResponse::from)
					.collect(Collectors.toCollection(ArrayList::new));
		} else {
			stores = getAllStores();
		}
		return stores;
	}

	public static List<Long> parseIds(String idsParam) {
		if (idsParam == null || idsParam.isBlank()) {
			return List.of();
		}
		return Arrays.stream(idsParam.split(","))
				.map(String::trim)
				.filter(s -> !s.isEmpty())
				.map(Long::valueOf)
				.toList();
	}
}
