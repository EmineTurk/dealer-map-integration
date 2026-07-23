package com.turkcell.stock_service.infrastructure.persistence;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class StockPersistenceAdapterTest {

    private StockRepository stockRepository;
    private StockPersistenceAdapter stockPersistenceAdapter;

    @BeforeEach
    void setUp() {
        stockRepository = mock(StockRepository.class);
        stockPersistenceAdapter = new StockPersistenceAdapter(
                stockRepository,
                new StockMapper()
        );
    }

    @Test
    void shouldReportSuccessfulStockUpdate() {
        when(stockRepository.updateQuantity(1L, 10L, 4)).thenReturn(1);

        boolean updated = stockPersistenceAdapter.updateQuantity(1L, 10L, 4);

        assertThat(updated).isTrue();
        verify(stockRepository).updateQuantity(1L, 10L, 4);
    }

    @Test
    void shouldReportMissingStockRecord() {
        when(stockRepository.updateQuantity(1L, 999L, 4)).thenReturn(0);

        boolean updated = stockPersistenceAdapter.updateQuantity(1L, 999L, 4);

        assertThat(updated).isFalse();
    }
}
