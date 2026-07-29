package com.turkcell.store_service.presentation.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.turkcell.store_service.application.dto.StoreResponse;
import com.turkcell.store_service.application.dto.UpdateStoreStatusRequest;
import com.turkcell.store_service.application.service.StoreApplicationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/stores")
@Validated
@Tag(name = "Stores", description = "Bayi master data (store-service)")
public class StoreController {

	private final StoreApplicationService storeService;

	public StoreController(StoreApplicationService storeService) {
		this.storeService = storeService;
	}

	@GetMapping
	@Operation(summary = "Bayileri listeler", description = """
			Üç sorgu şekli:
			1) Parametresiz → tüm bayiler
			2) ?ids=1,5,9 → toplu ID sorgusu (stock/capability servisleri için)
			3) ?city=&district= → bölgesel filtre
			""")
	@ApiResponses({
			@ApiResponse(responseCode = "200", description = "Bayi listesi (boş olabilir)"),
			@ApiResponse(responseCode = "400", description = "Geçersiz parametre")
	})
	public List<StoreResponse> getStores(
			@RequestParam(required = false) String ids,
			@RequestParam(required = false) String city,
			@RequestParam(required = false) String district) {
		return storeService.getStores(ids, city, district);
	}

	@GetMapping("/{id}")
	@Operation(summary = "Tek bayi detayı")
	@ApiResponses({
			@ApiResponse(responseCode = "200", description = "Bayi bulundu"),
			@ApiResponse(responseCode = "404", description = "Bayi bulunamadı"),
			@ApiResponse(responseCode = "400", description = "Geçersiz ID")
	})
	public StoreResponse getStoreById(
			@PathVariable @Positive(message = "Bayi ID değeri pozitif olmalıdır") Long id) {
		return storeService.getStoreById(id);
	}

	@PutMapping("/{id}/status")
	@ResponseStatus(HttpStatus.OK)
	@Operation(summary = "Bayi durumunu günceller", description = "ACTIVE / INACTIVE — cache invalidate edilir")
	@ApiResponses({
			@ApiResponse(responseCode = "200", description = "Durum güncellendi"),
			@ApiResponse(responseCode = "400", description = "Geçersiz status"),
			@ApiResponse(responseCode = "404", description = "Bayi bulunamadı")
	})
	public StoreResponse updateStoreStatus(
			@PathVariable @Positive(message = "Bayi ID değeri pozitif olmalıdır") Long id,
			@Valid @RequestBody UpdateStoreStatusRequest request) {
		return storeService.updateStoreStatus(id, request.status());
	}
}
