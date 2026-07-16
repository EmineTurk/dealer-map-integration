package com.turkcell.stock_service.application;

import com.turkcell.stock_service.entity.ProductEntity;
import com.turkcell.stock_service.presentation.dto.ProductResponse;
import com.turkcell.stock_service.repository.ProductRepository;
import org.springframework.stereotype.Service;
import com.turkcell.stock_service.presentation.exception.ProductNotFoundException;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
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

    private ProductResponse toResponse(ProductEntity product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSku(),
                product.getCategory()
        );
    }
}