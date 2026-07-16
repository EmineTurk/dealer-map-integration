package com.turkcell.stock_service.presentation.exception;

public class ProductNotFoundException extends RuntimeException {

    public ProductNotFoundException(Long id) {
        super("Ürün bulunamadı: id=" + id);
    }
}