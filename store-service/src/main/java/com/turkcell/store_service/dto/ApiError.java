package com.turkcell.store_service.dto;

import java.time.Instant;

/**
 * Shared error body from the API contract.
 */
public record ApiError(
		int status,
		String message,
		String timestamp
) {
	public static ApiError of(int status, String message) {
		return new ApiError(status, message, Instant.now().toString());
	}
}
