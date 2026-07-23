package com.turkcell.stock_service.application.service;

import com.turkcell.stock_service.application.dto.StockResponse;
import com.turkcell.stock_service.application.port.out.ProductQueryPort;
import com.turkcell.stock_service.application.port.out.StockCommandPort;
import com.turkcell.stock_service.application.port.out.StockQueryPort;
import com.turkcell.stock_service.application.port.out.StoreQueryPort;
import com.turkcell.stock_service.domain.exception.StockNotFoundException;
import com.turkcell.stock_service.domain.model.Stock;
import com.turkcell.stock_service.domain.model.Store;
import com.turkcell.stock_service.domain.model.StoreType;
import com.turkcell.stock_service.domain.service.DistanceCalculator;
import com.turkcell.stock_service.domain.service.StockLevelPolicy;
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
import java.util.Objects;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringJUnitConfig(ProductStockServiceCacheTest.TestConfig.class)
class ProductStockServiceCacheTest {

    @Autowired
    private ProductStockService productStockService;

    @Autowired
    private StockUpdateService stockUpdateService;

    @Autowired
    private ProductQueryPort productQueryPort;

    @Autowired
    private StockQueryPort stockQueryPort;

    @Autowired
    private StoreQueryPort storeQueryPort;

    @Autowired
    private StockCommandPort stockCommandPort;

    @Autowired
    private CacheManager cacheManager;

    @BeforeEach
    void setUp() {
        reset(productQueryPort, stockQueryPort, storeQueryPort, stockCommandPort);
        Objects.requireNonNull(cacheManager.getCache("product-stores")).clear();
    }

    @Test
    void shouldReadProductStoreSearchFromSourcesOnlyOnceForSameParameters() {
        prepareSearchSources();

        List<StockResponse> firstCall =
                productStockService.getStoresByProductId(1L, 41.02, 29.01, 10);
        List<StockResponse> secondCall =
                productStockService.getStoresByProductId(1L, 41.02, 29.01, 10);

        assertThat(firstCall).isEqualTo(secondCall);
        assertThat(secondCall).singleElement().satisfies(result ->
                assertThat(result.id()).isEqualTo(10L)
        );
        verify(productQueryPort, times(1)).existsById(1L);
        verify(stockQueryPort, times(1)).findByProductId(1L);
        verify(storeQueryPort, times(1)).getStoresByIds(List.of(10L));
    }

    @Test
    void shouldUseDifferentCacheEntriesWhenSearchParametersChange() {
        prepareSearchSources();

        productStockService.getStoresByProductId(1L, 41.02, 29.01, 10);
        productStockService.getStoresByProductId(1L, 41.02, 29.01, 20);

        verify(productQueryPort, times(2)).existsById(1L);
        verify(stockQueryPort, times(2)).findByProductId(1L);
        verify(storeQueryPort, times(2)).getStoresByIds(List.of(10L));
    }

    @Test
    void shouldEvictProductStoreCacheAfterSuccessfulStockUpdate() {
        prepareSearchSources();
        when(stockCommandPort.updateQuantity(1L, 10L, 4)).thenReturn(true);

        productStockService.getStoresByProductId(1L, 41.02, 29.01, 10);
        productStockService.getStoresByProductId(1L, 41.02, 29.01, 10);
        stockUpdateService.updateStock(1L, 10L, 4);
        productStockService.getStoresByProductId(1L, 41.02, 29.01, 10);

        verify(stockCommandPort).updateQuantity(1L, 10L, 4);
        verify(stockQueryPort, times(2)).findByProductId(1L);
        verify(storeQueryPort, times(2)).getStoresByIds(List.of(10L));
    }

    @Test
    void shouldKeepProductStoreCacheWhenStockUpdateFails() {
        prepareSearchSources();
        when(stockCommandPort.updateQuantity(1L, 999L, 4)).thenReturn(false);

        productStockService.getStoresByProductId(1L, 41.02, 29.01, 10);

        assertThatThrownBy(() -> stockUpdateService.updateStock(1L, 999L, 4))
                .isInstanceOf(StockNotFoundException.class);

        productStockService.getStoresByProductId(1L, 41.02, 29.01, 10);

        verify(stockQueryPort, times(1)).findByProductId(1L);
        verify(storeQueryPort, times(1)).getStoresByIds(List.of(10L));
    }

    private void prepareSearchSources() {
        when(productQueryPort.existsById(1L)).thenReturn(true);
        when(stockQueryPort.findByProductId(1L)).thenReturn(List.of(
                new Stock(1L, 10L, 6)
        ));
        when(storeQueryPort.getStoresByIds(List.of(10L))).thenReturn(List.of(
                new Store(
                        10L,
                        "Turkcell Kadikoy TIM",
                        "Sogutlucesme Cd. No: 42",
                        "Istanbul",
                        "Kadikoy",
                        41.02,
                        29.01,
                        StoreType.TIM,
                        "+90 216 555 0101",
                        "09:00 - 21:00"
                )
        ));
    }

    @Configuration(proxyBeanMethods = false)
    @EnableCaching
    static class TestConfig {

        @Bean
        ProductQueryPort productQueryPort() {
            return mock(ProductQueryPort.class);
        }

        @Bean
        StockQueryPort stockQueryPort() {
            return mock(StockQueryPort.class);
        }

        @Bean
        StoreQueryPort storeQueryPort() {
            return mock(StoreQueryPort.class);
        }

        @Bean
        StockCommandPort stockCommandPort() {
            return mock(StockCommandPort.class);
        }

        @Bean
        ProductStockService productStockService(
                ProductQueryPort productQueryPort,
                StockQueryPort stockQueryPort,
                StoreQueryPort storeQueryPort
        ) {
            return new ProductStockService(
                    productQueryPort,
                    stockQueryPort,
                    storeQueryPort,
                    new DistanceCalculator(),
                    new StockLevelPolicy()
            );
        }

        @Bean
        StockUpdateService stockUpdateService(
                ProductQueryPort productQueryPort,
                StockCommandPort stockCommandPort
        ) {
            return new StockUpdateService(productQueryPort, stockCommandPort);
        }

        @Bean
        CacheManager cacheManager() {
            return new ConcurrentMapCacheManager("product-stores");
        }
    }
}
