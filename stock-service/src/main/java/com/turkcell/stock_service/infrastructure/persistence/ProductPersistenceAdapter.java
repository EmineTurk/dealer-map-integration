package com.turkcell.stock_service.infrastructure.persistence;

import com.turkcell.stock_service.application.port.out.ProductQueryPort;
import com.turkcell.stock_service.domain.model.Product;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProductPersistenceAdapter implements ProductQueryPort {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public ProductPersistenceAdapter(
            ProductRepository productRepository,
            ProductMapper productMapper
    ) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    @Override
    public List<Product> findAll() {
        return productRepository.findAll()
                .stream()
                .map(productMapper::toDomain)
                .toList();
    }

    @Override
    public boolean existsById(Long id) {
        return productRepository.existsById(id);
    }
}
