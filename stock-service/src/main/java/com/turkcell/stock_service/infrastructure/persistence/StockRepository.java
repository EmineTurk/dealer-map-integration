package com.turkcell.stock_service.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockRepository extends JpaRepository<StockEntity, StockId> {

    List<StockEntity> findByProductId(Long productId);
}