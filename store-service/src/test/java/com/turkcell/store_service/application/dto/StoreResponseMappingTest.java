package com.turkcell.store_service.application.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import com.turkcell.store_service.domain.model.Store;
import com.turkcell.store_service.domain.model.StoreStatus;
import com.turkcell.store_service.domain.model.StoreType;

class StoreResponseMappingTest {

	@Test
	void fromMapsDomainEnumsToStrings() {
		Store store = new Store(
				1L, "Turkcell Kadikoy TIM", "Address",
				"Istanbul", "Kadikoy", 40.99, 29.02,
				StoreType.TIM, "+90 216 555 0101", "09:00 - 21:00",
				StoreStatus.ACTIVE, true);

		StoreResponse response = StoreResponse.from(store);

		assertThat(response.type()).isEqualTo("TIM");
		assertThat(response.status()).isEqualTo("ACTIVE");
		assertThat(response.directionsUrl()).contains("google.com/maps");
	}
}
