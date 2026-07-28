package com.turkcell.store_service.application.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateStoreStatusRequest(
		@NotBlank(message = "status zorunludur")
		String status
) {
}
