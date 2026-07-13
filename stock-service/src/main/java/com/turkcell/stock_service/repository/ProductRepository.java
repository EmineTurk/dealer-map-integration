package com.turkcell.stock_service.repository;

import com.turkcell.stock_service.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<ProductEntity, Long> {
}