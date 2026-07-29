package com.turkcell.store_service.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import com.turkcell.store_service.domain.model.StoreStatus;

class StoreDataLoaderTest {

	@Test
	void shouldCreateOneHundredUniqueActiveStores() {
		var stores = StoreDataLoader.seedStores();

		assertThat(stores).hasSize(100);
		assertThat(stores)
				.extracting(StoreEntity::getId)
				.doesNotHaveDuplicates()
				.containsExactlyInAnyOrderElementsOf(
						java.util.stream.LongStream.rangeClosed(1, 100).boxed().toList());
		assertThat(stores)
				.extracting(StoreEntity::getStatus)
				.containsOnly(StoreStatus.ACTIVE);
		assertThat(stores.stream()
				.map(StoreEntity::getDistrict)
				.collect(java.util.stream.Collectors.toSet()))
				.hasSize(39);
		assertThat(stores.stream()
				.collect(java.util.stream.Collectors.groupingBy(
						StoreEntity::getDistrict,
						java.util.stream.Collectors.counting()))
				.values())
				.allMatch(count -> count >= 2 && count <= 3);
	}
}
