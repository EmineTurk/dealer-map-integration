package com.turkcell.capability_service.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.stream.LongStream;

import org.junit.jupiter.api.Test;

class CapabilityDataLoaderTest {

	@Test
	void shouldAssignCapabilitiesToAllOneHundredStores() {
		var capabilities = CapabilityDataLoader.seed();

		assertThat(capabilities).hasSize(300);
		assertThat(capabilities)
				.extracting(StoreCapabilityEntity::getStoreId)
				.containsAll(LongStream.rangeClosed(1, 100).boxed().toList());
	}
}
