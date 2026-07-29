package com.turkcell.store_service.util;

import java.util.Collection;
import java.util.stream.Collectors;

public final class CacheKeys {

	private CacheKeys() {
	}

	/**
	 * Normalizes an ID collection into a stable Redis cache key
	 * (sorted, comma-joined) so that [1,2] and [2,1] share the same entry.
	 */
	public static String sortedIds(Collection<Long> ids) {
		if (ids == null || ids.isEmpty()) {
			return "";
		}
		return ids.stream()
				.sorted()
				.map(String::valueOf)
				.collect(Collectors.joining(","));
	}
}
