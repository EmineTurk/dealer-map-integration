package com.turkcell.capability_service.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.turkcell.capability_service.application.dto.StoreCapabilityResult;
import com.turkcell.capability_service.domain.exception.CapabilityTypeNotFoundException;
import com.turkcell.capability_service.domain.model.CapabilityType;
import com.turkcell.capability_service.domain.service.DistanceCalculator;
import com.turkcell.capability_service.infrastructure.client.StoreDto;
import com.turkcell.capability_service.infrastructure.client.StoreServiceClient;

@ExtendWith(MockitoExtension.class)
class CapabilityApplicationServiceTest {

	@Mock
	private CapabilityPersistenceService persistenceService;

	@Mock
	private StoreServiceClient storeServiceClient;

	@Mock
	private DistanceCalculator distanceCalculator;

	private CapabilityApplicationService service;

	@BeforeEach
	void setUp() {
		service = new CapabilityApplicationService(
				persistenceService, storeServiceClient, distanceCalculator);
	}

	@Test
	void findStoresByCapabilityFetchesIdsThenCallsHttpOutsidePersistence() {
		when(persistenceService.findStoreIdsByCapabilityType(CapabilityType.DEVICE_REPAIR))
				.thenReturn(List.of(3L));
		StoreDto store = new StoreDto(
				3L, "Sisli TIM", "Addr", "Istanbul", "Sisli",
				41.06, 28.98, "TIM", "+90", "09-22", "ACTIVE", true);
		when(storeServiceClient.getStoresByIds(List.of(3L))).thenReturn(List.of(store));
		when(distanceCalculator.calculate(41.0, 29.0, 41.06, 28.98)).thenReturn(3.7);

		List<StoreCapabilityResult> results = service.findStoresByCapability(
				"DEVICE_REPAIR", 41.0, 29.0, 10.0, null, null);

		assertThat(results).hasSize(1);
		assertThat(results.getFirst().distance()).isEqualTo(3.7);
		verify(persistenceService).findStoreIdsByCapabilityType(CapabilityType.DEVICE_REPAIR);
		verify(storeServiceClient).getStoresByIds(List.of(3L));
	}

	@Test
	void findStoresByCapabilitySkipsHttpWhenNoStoreIds() {
		when(persistenceService.findStoreIdsByCapabilityType(CapabilityType.NEW_LINE))
				.thenReturn(List.of());

		assertThat(service.findStoresByCapability(
				"NEW_LINE", 41.0, 29.0, 10.0, null, null)).isEmpty();
		verify(storeServiceClient, never()).getStoresByIds(anyList());
	}

	@Test
	void findStoresByCapabilityThrows404ForUnknownType() {
		assertThatThrownBy(() -> service.findStoresByCapability(
				"NOT_A_TYPE", 41.0, 29.0, 10.0, null, null))
				.isInstanceOf(CapabilityTypeNotFoundException.class);
		verify(persistenceService, never()).findStoreIdsByCapabilityType(org.mockito.ArgumentMatchers.any());
		verify(storeServiceClient, never()).getStoresByIds(anyList());
	}

	@Test
	void assignCapabilityDelegatesToPersistence() {
		service.assignCapability("BILL_PAYMENT", 5L);
		verify(persistenceService).assignCapability(5L, CapabilityType.BILL_PAYMENT);
	}

	@Test
	void removeCapabilityRejectsUnknownType() {
		assertThatThrownBy(() -> service.removeCapability("BAD", 1L))
				.isInstanceOf(CapabilityTypeNotFoundException.class);
		verify(persistenceService, never()).removeCapability(
				org.mockito.ArgumentMatchers.anyLong(),
				org.mockito.ArgumentMatchers.any());
	}
}
