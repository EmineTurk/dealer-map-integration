package com.turkcell.stock_service.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "PRODUCT")
public class ProductEntity {

    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "NAME")
    private String name;

    @Column(name = "SKU")
    private String sku;

    @Column(name = "CATEGORY")
    private String category;

    protected ProductEntity() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSku() {
        return sku;
    }

    public String getCategory() {
        return category;
    }
}
