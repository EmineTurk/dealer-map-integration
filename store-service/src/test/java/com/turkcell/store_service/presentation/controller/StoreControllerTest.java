package com.turkcell.store_service.presentation.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
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

import com.turkcell.store_service.application.dto.StoreResponse;
import com.turkcell.store_service.application.service.StoreApplicationService;
import com.turkcell.store_service.domain.exception.StoreNotFoundException;

@WebMvcTest(StoreController.class)
@MockitoBean(types = StoreApplicationService.class)
class StoreControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private StoreApplicationService storeService;

	@Test
	void getStoresDelegatesRoutingToApplicationService() throws Exception {
		when(storeService.getStores("1,2", null, null)).thenReturn(List.of());

		mockMvc.perform(get("/stores").param("ids", "1,2"))
				.andExpect(status().isOk());

		verify(storeService).getStores("1,2", null, null);
	}

	@Test
	void getStoreByIdReturnsContract() throws Exception {
		when(storeService.getStoreById(1L)).thenReturn(sampleStore());

		mockMvc.perform(get("/stores/1"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(1))
				.andExpect(jsonPath("$.name").value("Turkcell Kadikoy TIM"))
				.andExpect(jsonPath("$.type").value("TIM"))
				.andExpect(jsonPath("$.status").value("ACTIVE"));
	}

	@Test
	void getStoreByIdReturns404ApiError() throws Exception {
		when(storeService.getStoreById(999L)).thenThrow(new StoreNotFoundException(999L));

		mockMvc.perform(get("/stores/999"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.status").value(404))
				.andExpect(jsonPath("$.message").value("Bayi bulunamadı: id=999"))
				.andExpect(jsonPath("$.timestamp").exists());
	}

	@Test
	void getStoreByIdReturns400ForNonPositiveId() throws Exception {
		mockMvc.perform(get("/stores/0"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.message").value("Bayi ID değeri pozitif olmalıdır"));

		verifyNoInteractions(storeService);
	}

	@Test
	void updateStatusReturns400ForBlankBody() throws Exception {
		mockMvc.perform(put("/stores/1/status")
						.contentType(APPLICATION_JSON)
						.content("{\"status\":\"\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400));
	}

	@Test
	void updateStatusReturns400ForInvalidStatus() throws Exception {
		when(storeService.updateStoreStatus(1L, "UNKNOWN"))
				.thenThrow(new IllegalArgumentException("Geçersiz status: UNKNOWN (beklenen: ACTIVE, INACTIVE)"));

		mockMvc.perform(put("/stores/1/status")
						.contentType(APPLICATION_JSON)
						.content("{\"status\":\"UNKNOWN\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.message").value(
						"Geçersiz status: UNKNOWN (beklenen: ACTIVE, INACTIVE)"));
	}

	@Test
	void updateStatusReturns404WhenStoreMissing() throws Exception {
		when(storeService.updateStoreStatus(999L, "INACTIVE"))
				.thenThrow(new StoreNotFoundException(999L));

		mockMvc.perform(put("/stores/999/status")
						.contentType(APPLICATION_JSON)
						.content("{\"status\":\"INACTIVE\"}"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.status").value(404));
	}

	private static StoreResponse sampleStore() {
		return new StoreResponse(
				1L,
				"Turkcell Kadikoy TIM",
				"Sogutlucesme Cd. No: 42, Kadikoy",
				"Istanbul",
				"Kadikoy",
				40.9901,
				29.0253,
				"TIM",
				"+90 216 555 0101",
				"09:00 - 21:00",
				"ACTIVE",
				true,
				"https://www.google.com/maps/dir/?api=1&destination=40.9901,29.0253");
	}
}
