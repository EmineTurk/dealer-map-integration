package com.turkcell.stock_service.domain.service;

import com.turkcell.stock_service.domain.model.StockLevel;

public class StockLevelPolicy {

    public StockLevel determine(int quantity) {
        if (quantity == 0) {
            return StockLevel.OUT_OF_STOCK;
        }

        if (quantity <= 5) {
            return StockLevel.LOW;
        }

        return StockLevel.IN_STOCK;
    }
}
