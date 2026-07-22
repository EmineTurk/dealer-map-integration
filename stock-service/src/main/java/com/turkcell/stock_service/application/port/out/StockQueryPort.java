package com.turkcell.stock_service.application.port.out;

import com.turkcell.stock_service.domain.model.Stock;

import java.util.List;

public interface StockQueryPort {

    List<Stock> findByProductId(Long productId);
}
