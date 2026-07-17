package com.turkcell.stock_service.domain.exception;

public class ProductNotFoundException extends RuntimeException {

    public ProductNotFoundException(Long id) {
        super("Ürün bulunamadı: id=" + id);
    }
}