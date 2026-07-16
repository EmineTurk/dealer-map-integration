package com.turkcell.stock_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "STOCK")
@Getter
@Setter
@IdClass(StockId.class)
public class StockEntity {

    @Id
    @Column(name = "PRODUCT_ID")
    private Long productId;

    @Id
    @Column(name = "STORE_ID")
    private Long storeId;

    @Column(name = "QUANTITY", nullable = false)
    private Integer quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "PRODUCT_ID",
            referencedColumnName = "ID",
            insertable = false,
            updatable = false
    )
    private ProductEntity product;
}