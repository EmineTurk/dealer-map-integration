package com.turkcell.stock_service.application.service;

import com.turkcell.stock_service.application.dto.ProductResponse;
import com.turkcell.stock_service.application.dto.StockResponse;
import com.turkcell.stock_service.domain.exception.ProductNotFoundException;
import com.turkcell.stock_service.domain.model.StockLevel;
import com.turkcell.stock_service.infrastructure.persistence.ProductEntity;
import com.turkcell.stock_service.infrastructure.persistence.ProductRepository;
import com.turkcell.stock_service.infrastructure.persistence.StockRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final StockRepository stockRepository;

    public ProductService(
            ProductRepository productRepository,
            StockRepository stockRepository
    ) {
        this.productRepository = productRepository;
        this.stockRepository = stockRepository;
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductResponse getProductById(Long id) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        return toResponse(product);
    }

    public List<StockResponse> getStoresByProductId(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ProductNotFoundException(productId);
        }

        return stockRepository.findByProductId(productId)
                .stream()
                .map(stock -> new StockResponse(
                        stock.getProductId(),
                        stock.getStoreId(),
                        StockLevel.fromQuantity(stock.getQuantity())
                ))
                .toList();
    }

    private ProductResponse toResponse(ProductEntity product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSku(),
                product.getCategory()
        );
    }
}