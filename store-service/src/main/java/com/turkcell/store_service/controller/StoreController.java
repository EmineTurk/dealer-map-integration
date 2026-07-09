package com.turkcell.store_service.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.turkcell.store_service.dto.StoreResponse;
import com.turkcell.store_service.service.StoreService;

@RestController
@RequestMapping("/stores")
public class StoreController {

	private final StoreService storeService;

	public StoreController(StoreService storeService) {
		this.storeService = storeService;
	}

	@GetMapping
	public List<StoreResponse> getStores() {
		return storeService.getAllStores();
	}

	@GetMapping("/{id}")
	public StoreResponse getStoreById(@PathVariable Long id) {
		return storeService.getStoreById(id);
	}
}
