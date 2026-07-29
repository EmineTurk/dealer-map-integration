package com.turkcell.capability_service.presentation.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.turkcell.capability_service.application.dto.CapabilityTypeOption;
import com.turkcell.capability_service.application.dto.StoreCapabilityResult;
import com.turkcell.capability_service.application.service.CapabilityApplicationService;
import com.turkcell.capability_service.domain.exception.CapabilityTypeNotFoundException;

@WebMvcTest(CapabilityController.class)
@MockitoBean(types = CapabilityApplicationService.class)
class CapabilityControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private CapabilityApplicationService capabilityService;

	@Test
	void getTypesReturnsContract() throws Exception {
		when(capabilityService.getCapabilityTypes()).thenReturn(List.of(
				new CapabilityTypeOption("NEW_LINE", "Yeni Hat Başvurusu")));

		mockMvc.perform(get("/capabilities/types"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].key").value("NEW_LINE"))
				.andExpect(jsonPath("$[0].label").value("Yeni Hat Başvurusu"));
	}

	@Test
	void getStoresByCapabilityReturns200() throws Exception {
		when(capabilityService.findStoresByCapability(
				"DEVICE_REPAIR", 41.0, 29.0, 10.0, null, null))
				.thenReturn(List.of(sampleResult()));

		mockMvc.perform(get("/capabilities/DEVICE_REPAIR/stores")
						.param("lat", "41")
						.param("lng", "29")
						.param("radius", "10"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].id").value(3))
				.andExpect(jsonPath("$[0].distance").value(3.7));
	}

	@Test
	void getStoresByCapabilityReturns404ForUnknownType() throws Exception {
		when(capabilityService.findStoresByCapability(
				"UNKNOWN", 41.0, 29.0, 10.0, null, null))
				.thenThrow(new CapabilityTypeNotFoundException("UNKNOWN"));

		mockMvc.perform(get("/capabilities/UNKNOWN/stores")
						.param("lat", "41")
						.param("lng", "29")
						.param("radius", "10"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.status").value(404))
				.andExpect(jsonPath("$.message").value("İşlem tipi bulunamadı: type=UNKNOWN"))
				.andExpect(jsonPath("$.timestamp").exists());
	}

	@Test
	void getStoresByCapabilityReturns400ForInvalidRadius() throws Exception {
		mockMvc.perform(get("/capabilities/NEW_LINE/stores")
						.param("lat", "41")
						.param("lng", "29")
						.param("radius", "-1"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.message").value("Radius pozitif olmalıdır"));

		verifyNoInteractions(capabilityService);
	}

	@Test
	void getStoresByCapabilityReturns400ForMissingLat() throws Exception {
		mockMvc.perform(get("/capabilities/NEW_LINE/stores")
						.param("lng", "29")
						.param("radius", "10"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.message").value("Eksik parametre: lat"));
	}

	@Test
	void assignCapabilityReturns204() throws Exception {
		mockMvc.perform(put("/capabilities/NEW_LINE/stores/1"))
				.andExpect(status().isNoContent());

		verify(capabilityService).assignCapability("NEW_LINE", 1L);
	}

	@Test
	void removeCapabilityReturns204() throws Exception {
		mockMvc.perform(delete("/capabilities/NEW_LINE/stores/1"))
				.andExpect(status().isNoContent());

		verify(capabilityService).removeCapability("NEW_LINE", 1L);
	}

	@Test
	void assignCapabilityReturns400ForNonPositiveStoreId() throws Exception {
		mockMvc.perform(put("/capabilities/NEW_LINE/stores/0"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400));

		verifyNoInteractions(capabilityService);
	}

	private static StoreCapabilityResult sampleResult() {
		return new StoreCapabilityResult(
				3L,
				"Turkcell Sisli TIM",
				"Halaskargazi Cd. No: 150, Sisli",
				"Istanbul",
				"Sisli",
				41.0602,
				28.9877,
				"TIM",
				"+90 212 555 0103",
				"09:00 - 22:00",
				3.7,
				"https://www.google.com/maps/dir/?api=1&destination=41.0602,28.9877");
	}
}
