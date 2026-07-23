package com.turkcell.stock_service.application.service;

import com.turkcell.stock_service.application.port.out.ProductQueryPort;
import com.turkcell.stock_service.application.port.out.StockCommandPort;
import com.turkcell.stock_service.domain.exception.ProductNotFoundException;
import com.turkcell.stock_service.domain.exception.StockNotFoundException;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

@Service
public class StockUpdateService {

    private final ProductQueryPort productQueryPort;
    private final StockCommandPort stockCommandPort;

    public StockUpdateService(
            ProductQueryPort productQueryPort,
            StockCommandPort stockCommandPort
    ) {
        this.productQueryPort = productQueryPort;
        this.stockCommandPort = stockCommandPort;
    }

    @CacheEvict(cacheNames = "product-stores", allEntries = true)
    public void updateStock(Long productId, Long storeId, int quantity) {
        if (!productQueryPort.existsById(productId)) {
            throw new ProductNotFoundException(productId);
        }

        if (!stockCommandPort.updateQuantity(productId, storeId, quantity)) {
            throw new StockNotFoundException(productId, storeId);
        }
    }
}
