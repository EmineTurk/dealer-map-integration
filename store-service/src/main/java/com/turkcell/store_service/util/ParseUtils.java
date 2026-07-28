package com.turkcell.store_service.util;

import java.util.Arrays;
import java.util.List;

public final class ParseUtils {

	private ParseUtils() {
	}

	public static List<Long> parseIds(String idsParam) {
		if (idsParam == null || idsParam.isBlank()) {
			return List.of();
		}
		return Arrays.stream(idsParam.split(","))
				.map(String::trim)
				.filter(s -> !s.isEmpty())
				.map(Long::valueOf)
				.toList();
	}
}
