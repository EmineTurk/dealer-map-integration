package com.turkcell.stock_service.domain.exception;

public class StockNotFoundException extends RuntimeException {

    public StockNotFoundException(Long productId, Long storeId) {
        super("Stock not found: productId=" + productId + ", storeId=" + storeId);
    }
}
