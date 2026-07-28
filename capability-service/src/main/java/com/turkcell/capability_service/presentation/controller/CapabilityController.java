package com.turkcell.capability_service.presentation.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.turkcell.capability_service.application.dto.CapabilityTypeOption;
import com.turkcell.capability_service.application.dto.StoreCapabilityResult;
import com.turkcell.capability_service.application.service.CapabilityApplicationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/capabilities")
@Validated
@Tag(name = "Capabilities", description = "Bayi işlem yetkinlikleri (turkcell.com.tr)")
public class CapabilityController {

	private final CapabilityApplicationService capabilityService;

	public CapabilityController(CapabilityApplicationService capabilityService) {
		this.capabilityService = capabilityService;
	}

	@GetMapping("/types")
	@Operation(summary = "İşlem tipi listesi", description = "Dropdown / filtre için capability tipleri")
	@ApiResponse(responseCode = "200", description = "Tipler başarıyla listelendi")
	public List<CapabilityTypeOption> getTypes() {
		return capabilityService.getCapabilityTypes();
	}

	@GetMapping("/{type}/stores")
	@Operation(
			summary = "İşlemi yapabilen yakın bayiler",
			description = """
					Yetkin bayi ID'lerini bulur, store-service'ten detay çeker,
					opsiyonel workingHours/status filtreleri uygular,
					Haversine ile yarıçap içindeki bayileri mesafeye göre sıralar.
					""")
	@ApiResponses({
			@ApiResponse(responseCode = "200", description = "Bayi listesi (boş olabilir)"),
			@ApiResponse(responseCode = "400", description = "Geçersiz parametre"),
			@ApiResponse(responseCode = "404", description = "Geçersiz işlem tipi"),
			@ApiResponse(responseCode = "503", description = "store-service erişilemiyor")
	})
	public List<StoreCapabilityResult> getStoresByCapability(
			@PathVariable @NotBlank String type,
			@RequestParam
			@DecimalMin(value = "-90.0", message = "Latitude en az -90 olmalıdır")
			@DecimalMax(value = "90.0", message = "Latitude en fazla 90 olmalıdır")
			double lat,
			@RequestParam
			@DecimalMin(value = "-180.0", message = "Longitude en az -180 olmalıdır")
			@DecimalMax(value = "180.0", message = "Longitude en fazla 180 olmalıdır")
			double lng,
			@RequestParam
			@Positive(message = "Radius pozitif olmalıdır")
			double radius,
			@RequestParam(required = false) String workingHours,
			@RequestParam(required = false) String status) {
		return capabilityService.findStoresByCapability(type, lat, lng, radius, workingHours, status);
	}

	@PutMapping("/{type}/stores/{storeId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	@Operation(summary = "Bayiye yetkinlik atar", description = "Cache invalidate edilir")
	@ApiResponses({
			@ApiResponse(responseCode = "204", description = "Atandı"),
			@ApiResponse(responseCode = "404", description = "Geçersiz işlem tipi"),
			@ApiResponse(responseCode = "400", description = "Geçersiz storeId")
	})
	public void assignCapability(
			@PathVariable @NotBlank String type,
			@PathVariable @Positive(message = "Bayi ID değeri pozitif olmalıdır") Long storeId) {
		capabilityService.assignCapability(type, storeId);
	}

	@DeleteMapping("/{type}/stores/{storeId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	@Operation(summary = "Bayiden yetkinlik kaldırır", description = "Cache invalidate edilir")
	@ApiResponses({
			@ApiResponse(responseCode = "204", description = "Kaldırıldı"),
			@ApiResponse(responseCode = "404", description = "Geçersiz işlem tipi"),
			@ApiResponse(responseCode = "400", description = "Geçersiz storeId")
	})
	public void removeCapability(
			@PathVariable @NotBlank String type,
			@PathVariable @Positive(message = "Bayi ID değeri pozitif olmalıdır") Long storeId) {
		capabilityService.removeCapability(type, storeId);
	}
}
