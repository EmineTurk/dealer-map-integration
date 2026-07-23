package com.turkcell.stock_service.application.service;

import com.turkcell.stock_service.application.dto.ProductResponse;
import com.turkcell.stock_service.application.port.out.ProductQueryPort;
import com.turkcell.stock_service.domain.model.Product;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductQueryPort productQueryPort;

    @Test
    void shouldMapProductsToContractResponse() {
        when(productQueryPort.findAll()).thenReturn(List.of(
                new Product(2L, "iPhone 15 Pro 256GB", "APL-IPH15P-256", "Smartphones"),
                new Product(1L, "iPhone 15 128GB", "APL-IPH15-128", "Smartphones")
        ));

        ProductService productService = new ProductService(productQueryPort);

        assertThat(productService.getAllProducts())
                .extracting(ProductResponse::id)
                .containsExactly(1L, 2L);
    }
}
