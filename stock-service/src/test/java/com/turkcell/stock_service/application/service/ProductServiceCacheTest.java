package com.turkcell.stock_service.application.service;

import com.turkcell.stock_service.application.dto.ProductResponse;
import com.turkcell.stock_service.application.port.out.ProductQueryPort;
import com.turkcell.stock_service.domain.model.Product;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringJUnitConfig(ProductServiceCacheTest.TestConfig.class)
class ProductServiceCacheTest {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductQueryPort productQueryPort;

    @Autowired
    private CacheManager cacheManager;

    @BeforeEach
    void setUp() {
        reset(productQueryPort);
        cacheManager.getCache("products").clear();
    }

    @Test
    void shouldReadProductCatalogFromSourceOnlyOnce() {
        when(productQueryPort.findAll()).thenReturn(List.of(
                new Product(1L, "iPhone 15 128GB", "APL-IPH15-128", "Smartphones")
        ));

        List<ProductResponse> firstCall = productService.getAllProducts();
        List<ProductResponse> secondCall = productService.getAllProducts();

        assertThat(firstCall).isEqualTo(secondCall);
        assertThat(secondCall).singleElement().satisfies(product ->
                assertThat(product.name()).isEqualTo("iPhone 15 128GB")
        );
        verify(productQueryPort, times(1)).findAll();
    }

    @Configuration(proxyBeanMethods = false)
    @EnableCaching
    static class TestConfig {

        @Bean
        ProductQueryPort productQueryPort() {
            return mock(ProductQueryPort.class);
        }

        @Bean
        ProductService productService(ProductQueryPort productQueryPort) {
            return new ProductService(productQueryPort);
        }

        @Bean
        CacheManager cacheManager() {
            return new ConcurrentMapCacheManager("products");
        }
    }
}
