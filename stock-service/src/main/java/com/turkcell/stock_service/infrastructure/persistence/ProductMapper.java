package com.turkcell.stock_service.infrastructure.persistence;

import com.turkcell.stock_service.domain.model.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public Product toDomain(ProductEntity productEntity) {
        return new Product(
                productEntity.getId(),
                productEntity.getName(),
                productEntity.getSku(),
                productEntity.getCategory()
        );
    }
}
