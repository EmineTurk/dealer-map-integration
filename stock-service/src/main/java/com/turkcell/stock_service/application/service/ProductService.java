package com.turkcell.stock_service.application.service;

import com.turkcell.stock_service.application.dto.ProductResponse;
import com.turkcell.stock_service.application.port.out.ProductQueryPort;
import com.turkcell.stock_service.domain.model.Product;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class ProductService {

    private final ProductQueryPort productQueryPort;

    public ProductService(ProductQueryPort productQueryPort) {
        this.productQueryPort = productQueryPort;
    }

    public List<ProductResponse> getAllProducts() {
        return productQueryPort.findAll()
                .stream()
                .sorted(Comparator.comparing(Product::id))
                .map(this::toResponse)
                .toList();
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.id(),
                product.name(),
                product.sku(),
                product.category()
        );
    }
}
