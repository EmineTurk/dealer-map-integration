package com.turkcell.store_service.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.turkcell.store_service.application.dto.StoreResponse;
import com.turkcell.store_service.domain.exception.StoreNotFoundException;
import com.turkcell.store_service.domain.model.Store;
import com.turkcell.store_service.domain.model.StoreStatus;
import com.turkcell.store_service.domain.model.StoreType;
import com.turkcell.store_service.infrastructure.persistence.StoreEntity;
import com.turkcell.store_service.infrastructure.persistence.StoreJpaRepository;
import com.turkcell.store_service.infrastructure.persistence.StoreMapper;

@ExtendWith(MockitoExtension.class)
class StoreApplicationServiceTest {

	@Mock
	private StoreJpaRepository storeRepository;

	@Mock
	private StoreMapper storeMapper;

	private StoreApplicationService service;

	@BeforeEach
	void setUp() {
		service = new StoreApplicationService(storeRepository, storeMapper, null);
		// Replace self with the same instance for unit tests (no Spring proxy needed).
		service = new StoreApplicationService(storeRepository, storeMapper, service);
	}

	@Test
	void getStoresByIdsRoutesThroughParse() {
		StoreEntity entity = entity(1L);
		Store domain = domain(1L);
		when(storeRepository.findByIdIn(List.of(2L, 1L))).thenReturn(List.of(entity));
		when(storeMapper.toDomain(entity)).thenReturn(domain);

		List<StoreResponse> result = service.getStores("2,1", null, null);

		assertThat(result).hasSize(1);
		assertThat(result.getFirst().id()).isEqualTo(1L);
		assertThat(result.getFirst().type()).isEqualTo("TIM");
		verify(storeRepository).findByIdIn(List.of(2L, 1L));
		assertThat(StoreApplicationService.normalizeIdsKey(List.of(2L, 1L)))
				.isEqualTo("1,2");
	}

	@Test
	void getStoresByRegionDoesNotTouchIds() {
		when(storeRepository.findByCityIgnoreCaseAndDistrictIgnoreCase("Istanbul", "Kadikoy"))
				.thenReturn(List.of());

		assertThat(service.getStores(null, "Istanbul", "Kadikoy")).isEmpty();
		verify(storeRepository, never()).findByIdIn(anyList());
	}

	@Test
	void getStoreByIdThrowsWhenMissing() {
		when(storeRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.getStoreById(99L))
				.isInstanceOf(StoreNotFoundException.class)
				.hasMessageContaining("99");
	}

	@Test
	void updateStoreStatusRejectsUnknownValue() {
		StoreEntity entity = entity(1L);
		when(storeRepository.findById(1L)).thenReturn(Optional.of(entity));

		assertThatThrownBy(() -> service.updateStoreStatus(1L, "CLOSED"))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("Geçersiz status");
		verify(storeRepository, never()).save(any());
	}

	@Test
	void updateStoreStatusPersistsActiveToInactive() {
		StoreEntity entity = entity(1L);
		when(storeRepository.findById(1L)).thenReturn(Optional.of(entity));
		when(storeRepository.save(entity)).thenReturn(entity);
		when(storeMapper.toDomain(entity)).thenReturn(
				new Store(
						1L, "Store", "Addr", "Istanbul", "Kadikoy",
						40.0, 29.0, StoreType.TIM, "1", "09-21",
						StoreStatus.INACTIVE, true));

		StoreResponse updated = service.updateStoreStatus(1L, "inactive");

		verify(entity).setStatus(StoreStatus.INACTIVE);
		assertThat(updated.status()).isEqualTo("INACTIVE");
	}

	private StoreEntity entity(Long id) {
		StoreEntity e = org.mockito.Mockito.mock(StoreEntity.class);
		org.mockito.Mockito.lenient().when(e.getId()).thenReturn(id);
		org.mockito.Mockito.lenient().when(e.getStatus()).thenReturn(StoreStatus.ACTIVE);
		org.mockito.Mockito.lenient().doAnswer(invocation -> {
			StoreStatus status = invocation.getArgument(0);
			org.mockito.Mockito.lenient().when(e.getStatus()).thenReturn(status);
			return null;
		}).when(e).setStatus(org.mockito.ArgumentMatchers.any());
		return e;
	}

	private static Store domain(Long id) {
		return new Store(
				id, "Store", "Addr", "Istanbul", "Kadikoy",
				40.0, 29.0, StoreType.TIM, "1", "09-21",
				StoreStatus.ACTIVE, true);
	}
}
