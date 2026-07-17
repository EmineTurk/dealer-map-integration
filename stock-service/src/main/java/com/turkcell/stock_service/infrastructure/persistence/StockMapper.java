package com.turkcell.stock_service.infrastructure.persistence;

import com.turkcell.stock_service.domain.model.Stock;
import org.springframework.stereotype.Component;

@Component
public class StockMapper {

    public Stock toDomain(StockEntity stockEntity) {
        return new Stock(
                stockEntity.getProductId(),
                stockEntity.getStoreId(),
                stockEntity.getQuantity()
        );
    }

    public StockEntity toEntity(Stock stock) {
        StockEntity stockEntity = new StockEntity();

        stockEntity.setProductId(stock.getProductId());
        stockEntity.setStoreId(stock.getStoreId());
        stockEntity.setQuantity(stock.getQuantity());

        return stockEntity;
    }
}