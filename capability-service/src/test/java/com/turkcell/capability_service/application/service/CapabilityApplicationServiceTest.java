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

import com.turkcell.capability_service.application.dto.CapabilityTypeOption;
import com.turkcell.capability_service.application.dto.StoreCapabilityResult;
import com.turkcell.capability_service.domain.exception.CapabilityTypeNotFoundException;
import com.turkcell.capability_service.domain.model.CapabilityType;
import com.turkcell.capability_service.domain.service.DistanceCalculator;
import com.turkcell.capability_service.infrastructure.client.StoreDto;
import com.turkcell.capability_service.infrastructure.client.StoreServiceClient;

/**
 * Gün 18 — capability filtreleme + geo: Mockito ile store-service / DB kenarı mock,
 * mesafe hesabı gerçek {@link DistanceCalculator} ile.
 */
@ExtendWith(MockitoExtension.class)
class CapabilityApplicationServiceTest {

	private static final double USER_LAT = 41.0;
	private static final double USER_LNG = 29.0;

	@Mock
	private CapabilityPersistenceService persistenceService;

	@Mock
	private StoreServiceClient storeServiceClient;

	private CapabilityApplicationService service;

	@BeforeEach
	void setUp() {
		service = new CapabilityApplicationService(
				persistenceService, storeServiceClient, new DistanceCalculator());
	}

	@Test
	void findStoresByCapabilityFetchesIdsThenCallsHttpOutsidePersistence() {
		when(persistenceService.findStoreIdsByCapabilityType(CapabilityType.DEVICE_REPAIR))
				.thenReturn(List.of(3L));
		when(storeServiceClient.getStoresByIds(List.of(3L))).thenReturn(List.of(
				store(3L, "Sisli TIM", 41.06, 28.98, "ACTIVE", true)));

		List<StoreCapabilityResult> results = service.findStoresByCapability(
				"DEVICE_REPAIR", USER_LAT, USER_LNG, 10.0, null, null);

		assertThat(results).hasSize(1);
		assertThat(results.getFirst().id()).isEqualTo(3L);
		assertThat(results.getFirst().distance()).isPositive();
		assertThat(results.getFirst().directionsUrl()).contains("google.com/maps");
		verify(persistenceService).findStoreIdsByCapabilityType(CapabilityType.DEVICE_REPAIR);
		verify(storeServiceClient).getStoresByIds(List.of(3L));
	}

	@Test
	void findStoresByCapabilitySkipsHttpWhenNoStoreIds() {
		when(persistenceService.findStoreIdsByCapabilityType(CapabilityType.NEW_LINE))
				.thenReturn(List.of());

		assertThat(service.findStoresByCapability(
				"NEW_LINE", USER_LAT, USER_LNG, 10.0, null, null)).isEmpty();
		verify(storeServiceClient, never()).getStoresByIds(anyList());
	}

	@Test
	void findStoresByCapabilityThrows404ForUnknownType() {
		assertThatThrownBy(() -> service.findStoresByCapability(
				"NOT_A_TYPE", USER_LAT, USER_LNG, 10.0, null, null))
				.isInstanceOf(CapabilityTypeNotFoundException.class);
		verify(persistenceService, never()).findStoreIdsByCapabilityType(
				org.mockito.ArgumentMatchers.any());
		verify(storeServiceClient, never()).getStoresByIds(anyList());
	}

	@Test
	void filtersOutStoresBeyondRadius() {
		when(persistenceService.findStoreIdsByCapabilityType(CapabilityType.NEW_LINE))
				.thenReturn(List.of(1L, 2L));
		when(storeServiceClient.getStoresByIds(List.of(1L, 2L))).thenReturn(List.of(
				store(1L, "Near", 41.01, 29.0, "ACTIVE", true),
				store(2L, "Far", 42.5, 29.0, "ACTIVE", true)));

		List<StoreCapabilityResult> results = service.findStoresByCapability(
				"NEW_LINE", USER_LAT, USER_LNG, 5.0, null, null);

		assertThat(results).extracting(StoreCapabilityResult::id).containsExactly(1L);
		assertThat(results.getFirst().distance()).isLessThanOrEqualTo(5.0);
	}

	@Test
	void sortsResultsByDistanceAscending() {
		when(persistenceService.findStoreIdsByCapabilityType(CapabilityType.BILL_PAYMENT))
				.thenReturn(List.of(10L, 20L, 30L));
		when(storeServiceClient.getStoresByIds(List.of(10L, 20L, 30L))).thenReturn(List.of(
				store(30L, "Farther", 41.08, 29.0, "ACTIVE", true),
				store(10L, "Closest", 41.01, 29.0, "ACTIVE", true),
				store(20L, "Mid", 41.04, 29.0, "ACTIVE", true)));

		List<StoreCapabilityResult> results = service.findStoresByCapability(
				"BILL_PAYMENT", USER_LAT, USER_LNG, 50.0, null, null);

		assertThat(results).extracting(StoreCapabilityResult::id).containsExactly(10L, 20L, 30L);
		assertThat(results.get(0).distance()).isLessThan(results.get(1).distance());
		assertThat(results.get(1).distance()).isLessThan(results.get(2).distance());
	}

	@Test
	void statusFilterKeepsOnlyMatchingStores() {
		when(persistenceService.findStoreIdsByCapabilityType(CapabilityType.NUMBER_PORT))
				.thenReturn(List.of(1L, 2L));
		when(storeServiceClient.getStoresByIds(List.of(1L, 2L))).thenReturn(List.of(
				store(1L, "Active TIM", 41.01, 29.0, "ACTIVE", true),
				store(2L, "Closed", 41.02, 29.0, "INACTIVE", true)));

		List<StoreCapabilityResult> results = service.findStoresByCapability(
				"NUMBER_PORT", USER_LAT, USER_LNG, 20.0, null, "ACTIVE");

		assertThat(results).extracting(StoreCapabilityResult::id).containsExactly(1L);
	}

	@Test
	void statusFilterIsCaseInsensitive() {
		when(persistenceService.findStoreIdsByCapabilityType(CapabilityType.DEVICE_DELIVERY))
				.thenReturn(List.of(1L));
		when(storeServiceClient.getStoresByIds(List.of(1L))).thenReturn(List.of(
				store(1L, "Active", 41.01, 29.0, "ACTIVE", false)));

		assertThat(service.findStoresByCapability(
				"DEVICE_DELIVERY", USER_LAT, USER_LNG, 20.0, null, "active"))
				.extracting(StoreCapabilityResult::id)
				.containsExactly(1L);
	}

	@Test
	void weekendFilterKeepsOnlyStoresThatOpenWeekend() {
		when(persistenceService.findStoreIdsByCapabilityType(CapabilityType.DEVICE_REPAIR))
				.thenReturn(List.of(1L, 2L));
		when(storeServiceClient.getStoresByIds(List.of(1L, 2L))).thenReturn(List.of(
				store(1L, "Weekend open", 41.01, 29.0, "ACTIVE", true),
				store(2L, "Weekday only", 41.02, 29.0, "ACTIVE", false)));

		List<StoreCapabilityResult> results = service.findStoresByCapability(
				"DEVICE_REPAIR", USER_LAT, USER_LNG, 20.0, "weekend", null);

		assertThat(results).extracting(StoreCapabilityResult::id).containsExactly(1L);
	}

	@Test
	void weekendAndStatusFiltersCombine() {
		when(persistenceService.findStoreIdsByCapabilityType(CapabilityType.NEW_LINE))
				.thenReturn(List.of(1L, 2L, 3L));
		when(storeServiceClient.getStoresByIds(List.of(1L, 2L, 3L))).thenReturn(List.of(
				store(1L, "Match", 41.01, 29.0, "ACTIVE", true),
				store(2L, "Inactive weekend", 41.02, 29.0, "INACTIVE", true),
				store(3L, "Active weekday", 41.03, 29.0, "ACTIVE", false)));

		List<StoreCapabilityResult> results = service.findStoresByCapability(
				"NEW_LINE", USER_LAT, USER_LNG, 20.0, "weekend", "ACTIVE");

		assertThat(results).extracting(StoreCapabilityResult::id).containsExactly(1L);
	}

	@Test
	void blankStatusMeansNoStatusFilter() {
		when(persistenceService.findStoreIdsByCapabilityType(CapabilityType.BILL_PAYMENT))
				.thenReturn(List.of(1L, 2L));
		when(storeServiceClient.getStoresByIds(List.of(1L, 2L))).thenReturn(List.of(
				store(1L, "A", 41.01, 29.0, "ACTIVE", true),
				store(2L, "B", 41.02, 29.0, "INACTIVE", true)));

		assertThat(service.findStoresByCapability(
				"BILL_PAYMENT", USER_LAT, USER_LNG, 20.0, null, "  "))
				.extracting(StoreCapabilityResult::id)
				.containsExactly(1L, 2L);
	}

	@Test
	void nullStatusOnStoreTreatedAsActive() {
		when(persistenceService.findStoreIdsByCapabilityType(CapabilityType.NEW_LINE))
				.thenReturn(List.of(1L));
		when(storeServiceClient.getStoresByIds(List.of(1L))).thenReturn(List.of(
				store(1L, "Legacy", 41.01, 29.0, null, true)));

		assertThat(service.findStoresByCapability(
				"NEW_LINE", USER_LAT, USER_LNG, 20.0, null, "ACTIVE"))
				.extracting(StoreCapabilityResult::id)
				.containsExactly(1L);
	}

	@Test
	void getCapabilityTypesReturnsAllContractKeys() {
		List<CapabilityTypeOption> types = service.getCapabilityTypes();

		assertThat(types).extracting(CapabilityTypeOption::key)
				.containsExactly(
						"NEW_LINE",
						"DEVICE_DELIVERY",
						"DEVICE_REPAIR",
						"NUMBER_PORT",
						"BILL_PAYMENT");
		assertThat(types.getFirst().label()).isEqualTo("Yeni Hat Başvurusu");
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

	private static StoreDto store(
			long id,
			String name,
			double lat,
			double lng,
			String status,
			Boolean opensWeekend) {
		return new StoreDto(
				id, name, "Addr", "Istanbul", "Kadikoy",
				lat, lng, "TIM", "+90", "09:00 - 21:00", status, opensWeekend);
	}
}
