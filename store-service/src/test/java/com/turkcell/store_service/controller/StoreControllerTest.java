package com.turkcell.store_service.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import com.turkcell.store_service.exception.GlobalExceptionHandler;
import com.turkcell.store_service.repository.InMemoryStoreRepository;
import com.turkcell.store_service.service.StoreService;

@WebMvcTest(StoreController.class)
@Import({ StoreService.class, InMemoryStoreRepository.class, GlobalExceptionHandler.class })
class StoreControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void getStores_returnsInMemoryListMatchingContract() throws Exception {
		mockMvc.perform(get("/stores"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(15))
				.andExpect(jsonPath("$[0].id").value(1))
				.andExpect(jsonPath("$[0].name").value("Turkcell Kadikoy TIM"))
				.andExpect(jsonPath("$[0].city").value("Istanbul"))
				.andExpect(jsonPath("$[0].district").value("Kadikoy"))
				.andExpect(jsonPath("$[0].type").value("TIM"))
				.andExpect(jsonPath("$[0].phone").value("+90 216 555 0101"))
				.andExpect(jsonPath("$[0].workingHours").value("09:00 - 21:00"));
	}

	@Test
	void getStoreById_returnsStore() throws Exception {
		mockMvc.perform(get("/stores/1"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(1))
				.andExpect(jsonPath("$.latitude").value(40.9901))
				.andExpect(jsonPath("$.longitude").value(29.0253))
				.andExpect(jsonPath("$.phone").value("+90 216 555 0101"))
				.andExpect(jsonPath("$.workingHours").value("09:00 - 21:00"));
	}

	@Test
	void getStoreById_whenNotFound_returnsApiError() throws Exception {
		mockMvc.perform(get("/stores/999"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.status").value(404))
				.andExpect(jsonPath("$.message").value("Store not found: id=999"))
				.andExpect(jsonPath("$.timestamp").exists());
	}
}
