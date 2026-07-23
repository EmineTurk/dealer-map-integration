package com.turkcell.stock_service.application.port.out;

public interface StockCommandPort {

    boolean updateQuantity(Long productId, Long storeId, int quantity);
}
