package com.turkcell.capability_service.application.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.turkcell.capability_service.domain.model.CapabilityType;
import com.turkcell.capability_service.infrastructure.persistence.StoreCapabilityEntity;
import com.turkcell.capability_service.infrastructure.persistence.StoreCapabilityId;
import com.turkcell.capability_service.infrastructure.persistence.StoreCapabilityRepository;

/**
 * DB-only operations kept transactional and free of HTTP I/O.
 */
@Service
public class CapabilityPersistenceService {

	private final StoreCapabilityRepository capabilityRepository;

	public CapabilityPersistenceService(StoreCapabilityRepository capabilityRepository) {
		this.capabilityRepository = capabilityRepository;
	}

	@Transactional(readOnly = true)
	public List<Long> findStoreIdsByCapabilityType(CapabilityType type) {
		return capabilityRepository.findStoreIdsByCapabilityType(type);
	}

	@Transactional
	public void assignCapability(Long storeId, CapabilityType type) {
		StoreCapabilityId id = new StoreCapabilityId(storeId, type);
		if (!capabilityRepository.existsById(id)) {
			capabilityRepository.save(new StoreCapabilityEntity(storeId, type));
		}
	}

	@Transactional
	public void removeCapability(Long storeId, CapabilityType type) {
		StoreCapabilityId id = new StoreCapabilityId(storeId, type);
		if (capabilityRepository.existsById(id)) {
			capabilityRepository.deleteById(id);
		}
	}
}
