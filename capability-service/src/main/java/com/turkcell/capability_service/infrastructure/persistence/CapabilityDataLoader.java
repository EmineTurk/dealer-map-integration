package com.turkcell.capability_service.infrastructure.persistence;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.turkcell.capability_service.domain.model.CapabilityType;

/**
 * Keeps a balanced capability set synchronized for all 100 seeded stores.
 */
@Component
public class CapabilityDataLoader implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(CapabilityDataLoader.class);

	private final StoreCapabilityRepository repository;

	public CapabilityDataLoader(StoreCapabilityRepository repository) {
		this.repository = repository;
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		List<StoreCapabilityEntity> desiredCapabilities = seed();
		log.info(
				"Synchronizing STORE_CAPABILITY seed: current={}, desired={}",
				repository.count(),
				desiredCapabilities.size());
		repository.saveAll(desiredCapabilities);
		log.info("STORE_CAPABILITY seed synchronized ({} rows)", repository.count());
	}

	static List<StoreCapabilityEntity> seed() {
		List<StoreCapabilityEntity> rows = new ArrayList<>();
		for (long storeId = 1; storeId <= 100; storeId++) {
			rows.add(new StoreCapabilityEntity(storeId, CapabilityType.NEW_LINE));
			rows.add(new StoreCapabilityEntity(
					storeId,
					storeId % 2 == 0 ? CapabilityType.DEVICE_DELIVERY : CapabilityType.NUMBER_PORT));
			rows.add(new StoreCapabilityEntity(
					storeId,
					storeId % 3 == 0 ? CapabilityType.DEVICE_REPAIR : CapabilityType.BILL_PAYMENT));
		}

		return rows;
	}
}
