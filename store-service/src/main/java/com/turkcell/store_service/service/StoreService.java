package com.turkcell.store_service.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.turkcell.store_service.dto.StoreResponse;
import com.turkcell.store_service.repository.InMemoryStoreRepository;

@Service
public class StoreService {

	private final InMemoryStoreRepository storeRepository;

	public StoreService(InMemoryStoreRepository storeRepository) {
		this.storeRepository = storeRepository;
	}

	public List<StoreResponse> getAllStores() {
		return storeRepository.findAll();
	}

	public StoreResponse getStoreById(Long id) {
		return storeRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Store not found: " + id));
	}
}
