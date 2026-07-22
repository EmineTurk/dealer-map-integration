package com.turkcell.stock_service.presentation.controller;

import com.turkcell.stock_service.application.dto.ProductResponse;
import com.turkcell.stock_service.application.dto.StockResponse;
import com.turkcell.stock_service.application.service.ProductService;
import com.turkcell.stock_service.application.service.ProductStockService;
import com.turkcell.stock_service.domain.exception.ProductNotFoundException;
import com.turkcell.stock_service.domain.model.StockLevel;
import com.turkcell.stock_service.domain.model.StoreType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({ProductController.class, ProductStockController.class})
class ApiContractControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @MockBean
    private ProductStockService productStockService;

    @Test
    void shouldAllowFrontendCorsPreflight() throws Exception {
        mockMvc.perform(options("/products")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string(
                        "Access-Control-Allow-Origin",
                        "http://localhost:5173"
                ))
                .andExpect(header().string(
                        "Access-Control-Allow-Methods",
                        "GET,OPTIONS"
                ));
    }

    @Test
    void shouldReturnProductContract() throws Exception {
        when(productService.getAllProducts()).thenReturn(List.of(
                new ProductResponse(1L, "iPhone 15 128GB", "APL-IPH15-128", "Smartphones")
        ));

        mockMvc.perform(get("/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("iPhone 15 128GB"))
                .andExpect(jsonPath("$[0].sku").value("APL-IPH15-128"))
                .andExpect(jsonPath("$[0].category").value("Smartphones"));
    }

    @Test
    void shouldReturnStoreStockContractWithoutRawQuantity() throws Exception {
        when(productStockService.getStoresByProductId(1L, 41, 29, 10))
                .thenReturn(List.of(new StockResponse(
                        1L,
                        "Kadikoy TIM",
                        "Address",
                        "Istanbul",
                        "Kadikoy",
                        40.99,
                        29.02,
                        StoreType.TIM,
                        "+90 216 555 0101",
                        "09:00 - 21:00",
                        2.3,
                        StockLevel.IN_STOCK
                )));

        mockMvc.perform(get("/products/1/stores")
                        .param("lat", "41")
                        .param("lng", "29")
                        .param("radius", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].distance").value(2.3))
                .andExpect(jsonPath("$[0].stockLevel").value("IN_STOCK"))
                .andExpect(jsonPath("$[0].quantity").doesNotExist());
    }

    @Test
    void shouldReturnSharedApiErrorWhenRequestParameterIsMissing() throws Exception {
        mockMvc.perform(get("/products/1/stores")
                        .param("lat", "41")
                        .param("lng", "29"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Missing request parameter: radius"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void shouldReturnSharedApiErrorWhenProductDoesNotExist() throws Exception {
        when(productStockService.getStoresByProductId(99L, 41, 29, 10))
                .thenThrow(new ProductNotFoundException(99L));

        mockMvc.perform(get("/products/99/stores")
                        .param("lat", "41")
                        .param("lng", "29")
                        .param("radius", "10"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Product not found: id=99"))
                .andExpect(jsonPath("$.timestamp").exists());
    }
}
