package com.turkcell.stock_service.application.service;

import com.turkcell.stock_service.application.dto.StockResponse;
import com.turkcell.stock_service.application.port.out.ProductQueryPort;
import com.turkcell.stock_service.application.port.out.StockQueryPort;
import com.turkcell.stock_service.application.port.out.StoreQueryPort;
import com.turkcell.stock_service.domain.exception.ProductNotFoundException;
import com.turkcell.stock_service.domain.model.Stock;
import com.turkcell.stock_service.domain.model.StockLevel;
import com.turkcell.stock_service.domain.model.Store;
import com.turkcell.stock_service.domain.model.StoreType;
import com.turkcell.stock_service.domain.service.DistanceCalculator;
import com.turkcell.stock_service.domain.service.StockLevelPolicy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductStockServiceTest {

    @Mock
    private ProductQueryPort productQueryPort;

    @Mock
    private StockQueryPort stockQueryPort;

    @Mock
    private StoreQueryPort storeQueryPort;

    private ProductStockService productStockService;

    @BeforeEach
    void setUp() {
        productStockService = new ProductStockService(
                productQueryPort,
                stockQueryPort,
                storeQueryPort,
                new DistanceCalculator(),
                new StockLevelPolicy()
        );
    }

    @Test
    void shouldRejectUnknownProduct() {
        when(productQueryPort.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> productStockService.getStoresByProductId(
                99L,
                41,
                29,
                10
        ))
                .isInstanceOf(ProductNotFoundException.class)
                .hasMessage("Product not found: id=99");

        verifyNoInteractions(stockQueryPort, storeQueryPort);
    }

    @Test
    void shouldReturnEmptyListWithoutCallingStoreServiceWhenNoStockIsAvailable() {
        when(productQueryPort.existsById(1L)).thenReturn(true);
        when(stockQueryPort.findByProductId(1L)).thenReturn(List.of(
                new Stock(1L, 3L, 0)
        ));

        List<StockResponse> result = productStockService.getStoresByProductId(
                1L,
                41,
                29,
                10
        );

        assertThat(result).isEmpty();
        verifyNoInteractions(storeQueryPort);
    }

    @Test
    void shouldUseBulkLookupMapStockLevelsAndSortByDistance() {
        when(productQueryPort.existsById(1L)).thenReturn(true);
        when(stockQueryPort.findByProductId(1L)).thenReturn(List.of(
                new Stock(1L, 3L, 0),
                new Stock(1L, 1L, 4),
                new Stock(1L, 2L, 6)
        ));
        when(storeQueryPort.getStoresByIds(List.of(1L, 2L))).thenReturn(List.of(
                store(2L, 41.1),
                store(99L, 41.05),
                store(1L, 41.0)
        ));

        List<StockResponse> result = productStockService.getStoresByProductId(
                1L,
                41,
                29,
                20
        );

        assertThat(result).extracting(StockResponse::id).containsExactly(1L, 2L);
        assertThat(result).extracting(StockResponse::stockLevel)
                .containsExactly(StockLevel.LOW, StockLevel.IN_STOCK);
        assertThat(result).extracting(StockResponse::distance)
                .containsExactly(0.0, 11.1);
        verify(storeQueryPort).getStoresByIds(List.of(1L, 2L));
    }

    private Store store(Long id, double latitude) {
        return new Store(
                id,
                "Store " + id,
                "Address",
                "Istanbul",
                "Kadikoy",
                latitude,
                29,
                StoreType.TIM,
                "+90 216 555 0101",
                "09:00 - 21:00"
        );
    }
}
