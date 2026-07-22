package com.turkcell.stock_service.presentation.controller;

import com.turkcell.stock_service.application.dto.ProductResponse;
import com.turkcell.stock_service.application.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/products")
@Tag(
        name = "Products",
        description = "Urun katalog islemleri"
)
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(
            summary = "Tum urunleri getirir",
            description = "Oracle veritabaninda bulunan tum urunleri listeler."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Urunler basariyla getirildi"),
            @ApiResponse(responseCode = "500", description = "Sunucu hatasi")
    })
    public List<ProductResponse> getAllProducts() {
        return productService.getAllProducts();
    }
}
