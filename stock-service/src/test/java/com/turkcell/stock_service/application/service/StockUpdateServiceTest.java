package com.turkcell.stock_service.application.service;

import com.turkcell.stock_service.application.port.out.ProductQueryPort;
import com.turkcell.stock_service.application.port.out.StockCommandPort;
import com.turkcell.stock_service.domain.exception.ProductNotFoundException;
import com.turkcell.stock_service.domain.exception.StockNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StockUpdateServiceTest {

    @Mock
    private ProductQueryPort productQueryPort;

    @Mock
    private StockCommandPort stockCommandPort;

    private StockUpdateService stockUpdateService;

    @BeforeEach
    void setUp() {
        stockUpdateService = new StockUpdateService(productQueryPort, stockCommandPort);
    }

    @Test
    void shouldUpdateExistingStock() {
        when(productQueryPort.existsById(1L)).thenReturn(true);
        when(stockCommandPort.updateQuantity(1L, 10L, 4)).thenReturn(true);

        stockUpdateService.updateStock(1L, 10L, 4);

        verify(stockCommandPort).updateQuantity(1L, 10L, 4);
    }

    @Test
    void shouldRejectUnknownProductWithoutUpdatingStock() {
        when(productQueryPort.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> stockUpdateService.updateStock(99L, 10L, 4))
                .isInstanceOf(ProductNotFoundException.class)
                .hasMessage("Product not found: id=99");

        verifyNoInteractions(stockCommandPort);
    }

    @Test
    void shouldRejectMissingStockRecord() {
        when(productQueryPort.existsById(1L)).thenReturn(true);
        when(stockCommandPort.updateQuantity(1L, 999L, 4)).thenReturn(false);

        assertThatThrownBy(() -> stockUpdateService.updateStock(1L, 999L, 4))
                .isInstanceOf(StockNotFoundException.class)
                .hasMessage("Stock not found: productId=1, storeId=999");
    }
}
