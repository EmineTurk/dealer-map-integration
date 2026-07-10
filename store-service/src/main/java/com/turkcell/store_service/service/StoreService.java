package com.turkcell.store_service.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.turkcell.store_service.dto.StoreResponse;
import com.turkcell.store_service.exception.ResourceNotFoundException;
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
				.orElseThrow(() -> new ResourceNotFoundException("Store not found: id=" + id));
	}
}
