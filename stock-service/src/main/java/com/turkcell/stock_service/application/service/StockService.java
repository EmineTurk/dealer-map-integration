package com.turkcell.stock_service.application.service;

import com.turkcell.stock_service.application.dto.StockResponse;
import com.turkcell.stock_service.domain.model.Stock;
import com.turkcell.stock_service.infrastructure.persistence.StockMapper;
import com.turkcell.stock_service.infrastructure.persistence.StockRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StockService {

    private final StockRepository stockRepository;

    public StockService(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    public List<StockResponse> getStocksByProductId(Long productId) {
        return stockRepository.findByProductId(productId)
                .stream()
                .map(StockMapper::toDomain)
                .map(this::toResponse)
                .toList();
    }

    private StockResponse toResponse(Stock stock) {
        return new StockResponse(
                stock.getProductId(),
                stock.getStoreId(),
                stock.getStockLevel()
        );
    }
}