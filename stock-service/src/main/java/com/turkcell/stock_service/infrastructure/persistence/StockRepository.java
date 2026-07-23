package com.turkcell.stock_service.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StockRepository extends JpaRepository<StockEntity, StockEntityId> {

    List<StockEntity> findByProductId(Long productId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update StockEntity stock
               set stock.quantity = :quantity
             where stock.productId = :productId
               and stock.storeId = :storeId
            """)
    int updateQuantity(
            @Param("productId") Long productId,
            @Param("storeId") Long storeId,
            @Param("quantity") int quantity
    );
}
