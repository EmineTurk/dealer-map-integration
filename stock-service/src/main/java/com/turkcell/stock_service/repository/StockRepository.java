package com.turkcell.stock_service.repository;

import com.turkcell.stock_service.entity.StockEntity;
import com.turkcell.stock_service.entity.StockId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockRepository extends JpaRepository<StockEntity, StockId> {
}