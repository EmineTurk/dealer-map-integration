package com.turkcell.stock_service.infrastructure.persistence;

import com.turkcell.stock_service.domain.model.Stock;

public final class StockMapper {

    private StockMapper() {
    }

    public static Stock toDomain(StockEntity entity) {
        if (entity == null) {
            return null;
        }

        return new Stock(
                entity.getProductId(),
                entity.getStoreId(),
                entity.getQuantity()
        );
    }

    public static StockEntity toEntity(Stock stock) {
        if (stock == null) {
            return null;
        }

        StockEntity entity = new StockEntity();
        entity.setProductId(stock.getProductId());
        entity.setStoreId(stock.getStoreId());
        entity.setQuantity(stock.getQuantity());

        return entity;
    }
}