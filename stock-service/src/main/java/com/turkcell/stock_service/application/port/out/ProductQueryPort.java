package com.turkcell.stock_service.application.port.out;

import com.turkcell.stock_service.domain.model.Product;

import java.util.List;

public interface ProductQueryPort {

    List<Product> findAll();

    boolean existsById(Long id);
}
