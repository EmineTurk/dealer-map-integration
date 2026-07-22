package com.turkcell.stock_service.infrastructure.persistence;

import com.turkcell.stock_service.application.port.out.StockQueryPort;
import com.turkcell.stock_service.domain.model.Stock;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class StockPersistenceAdapter implements StockQueryPort {

    private final StockRepository stockRepository;
    private final StockMapper stockMapper;

    public StockPersistenceAdapter(
            StockRepository stockRepository,
            StockMapper stockMapper
    ) {
        this.stockRepository = stockRepository;
        this.stockMapper = stockMapper;
    }

    @Override
    public List<Stock> findByProductId(Long productId) {
        return stockRepository.findByProductId(productId)
                .stream()
                .map(stockMapper::toDomain)
                .toList();
    }
}
