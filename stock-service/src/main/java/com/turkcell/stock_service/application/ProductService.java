package com.turkcell.stock_service.application;

import com.turkcell.stock_service.presentation.dto.ProductResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    public List<ProductResponse> getProducts() {
        return List.of(
                new ProductResponse(1L, "iPhone 15 128GB", "APL-IPH15-128", "Smartphones"),
                new ProductResponse(2L, "Samsung Galaxy S24", "SMS-S24-256", "Smartphones"),
                new ProductResponse(3L, "AirPods Pro Gen 2", "APL-APP2", "Accessories")
        );
    }
}