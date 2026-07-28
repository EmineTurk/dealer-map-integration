package com.turkcell.store_service.util;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;

class CacheKeysTest {

	@Test
	void sortedIdsIsOrderIndependent() {
		assertThat(CacheKeys.sortedIds(List.of(2L, 1L, 9L)))
				.isEqualTo(CacheKeys.sortedIds(List.of(1L, 9L, 2L)))
				.isEqualTo("1,2,9");
	}

	@Test
	void sortedIdsHandlesEmpty() {
		assertThat(CacheKeys.sortedIds(List.of())).isEmpty();
		assertThat(CacheKeys.sortedIds(null)).isEmpty();
	}
}
