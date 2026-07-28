package com.turkcell.capability_service.application.dto;

import com.turkcell.capability_service.domain.model.CapabilityType;

/**
 * API contract {@code CapabilityTypeOption} — key is a String so the DTO
 * does not expose the domain enum type.
 */
public record CapabilityTypeOption(
		String key,
		String label
) {
	public static CapabilityTypeOption from(CapabilityType type) {
		return new CapabilityTypeOption(type.name(), type.getLabel());
	}
}
