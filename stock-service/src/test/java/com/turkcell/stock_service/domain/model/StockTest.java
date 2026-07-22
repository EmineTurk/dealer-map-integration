package com.turkcell.stock_service.domain.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class StockTest {

    @Test
    void shouldRejectNegativeQuantity() {
        assertThatThrownBy(() -> new Stock(1L, 1L, -1))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("quantity cannot be negative");
    }
}
