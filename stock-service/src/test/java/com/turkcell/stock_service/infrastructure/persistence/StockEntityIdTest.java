package com.turkcell.stock_service.infrastructure.persistence;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class StockEntityIdTest {

    @Test
    void shouldCompareCompositeIdsByProductAndStore() {
        StockEntityId first = new StockEntityId(1L, 10L);
        StockEntityId same = new StockEntityId(1L, 10L);
        StockEntityId differentProduct = new StockEntityId(2L, 10L);
        StockEntityId differentStore = new StockEntityId(1L, 11L);

        assertThat(first)
                .isEqualTo(same)
                .hasSameHashCodeAs(same)
                .isNotEqualTo(differentProduct)
                .isNotEqualTo(differentStore)
                .isNotEqualTo(null);
    }
}
