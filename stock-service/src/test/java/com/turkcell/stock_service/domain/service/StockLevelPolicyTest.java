package com.turkcell.stock_service.domain.service;

import com.turkcell.stock_service.domain.model.StockLevel;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class StockLevelPolicyTest {

    private final StockLevelPolicy stockLevelPolicy = new StockLevelPolicy();

    @Test
    void shouldReturnOutOfStockWhenQuantityIsZero() {
        assertThat(stockLevelPolicy.determine(0)).isEqualTo(StockLevel.OUT_OF_STOCK);
    }

    @Test
    void shouldReturnLowWhenQuantityIsBetweenOneAndFive() {
        assertThat(stockLevelPolicy.determine(1)).isEqualTo(StockLevel.LOW);
        assertThat(stockLevelPolicy.determine(5)).isEqualTo(StockLevel.LOW);
    }

    @Test
    void shouldReturnInStockWhenQuantityIsGreaterThanFive() {
        assertThat(stockLevelPolicy.determine(6)).isEqualTo(StockLevel.IN_STOCK);
    }
}
