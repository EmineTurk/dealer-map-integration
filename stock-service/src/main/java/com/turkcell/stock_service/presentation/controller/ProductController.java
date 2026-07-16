package com.turkcell.stock_service.presentation.controller;

import com.turkcell.stock_service.application.ProductService;
import com.turkcell.stock_service.presentation.dto.ProductResponse;
import jakarta.validation.constraints.Positive;
import org.springframework.validation.annotation.Validated;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/products")
@Validated
@Tag(
        name = "Products",
        description = "Ürün kataloğu işlemleri"
)
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(
            summary = "Tüm ürünleri getirir",
            description = "Oracle veritabanında bulunan tüm ürünleri listeler."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Ürünler başarıyla getirildi"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Sunucu hatası"
            )
    })
    public List<ProductResponse> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "ID ile ürün getirir",
            description = "Verilen ID değerine ait ürünü getirir."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Ürün başarıyla getirildi"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Geçersiz ürün ID değeri"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Ürün bulunamadı"
            )
    })
    public ProductResponse getProductById(
            @PathVariable
            @Positive(message = "Ürün ID değeri pozitif olmalıdır")
    Long id
    ){

        return productService.getProductById(id);
    }
}