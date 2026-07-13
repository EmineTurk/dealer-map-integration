package com.turkcell.stock_service.application;

import com.turkcell.stock_service.entity.ProductEntity;
import com.turkcell.stock_service.presentation.dto.ProductResponse;
import com.turkcell.stock_service.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductResponse> getProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::toResponse)
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