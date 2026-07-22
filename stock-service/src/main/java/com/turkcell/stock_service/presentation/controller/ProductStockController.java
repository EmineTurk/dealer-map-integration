package com.turkcell.stock_service.presentation.controller;

import com.turkcell.stock_service.application.dto.StockResponse;
import com.turkcell.stock_service.application.service.ProductStockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/products/{productId}/stores")
@Validated
@Tag(
        name = "Product Stocks",
        description = "Urun stok ve bayi uygunlugu islemleri"
)
public class ProductStockController {

    private final ProductStockService productStockService;

    public ProductStockController(ProductStockService productStockService) {
        this.productStockService = productStockService;
    }

    @GetMapping
    @Operation(
            summary = "Urunun stokta oldugu bayileri getirir",
            description = "Verilen urun ID degerine ait stoklu bayileri mesafeye gore listeler."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Stoklu bayiler basariyla getirildi"),
            @ApiResponse(responseCode = "400", description = "Gecersiz sorgu parametresi"),
            @ApiResponse(responseCode = "404", description = "Urun bulunamadi")
    })
    public List<StockResponse> getStoresByProductId(
            @PathVariable
            @Positive(message = "Urun ID degeri pozitif olmalidir")
            Long productId,

            @RequestParam
            @DecimalMin(value = "-90.0", message = "Latitude en az -90 olmalidir")
            @DecimalMax(value = "90.0", message = "Latitude en fazla 90 olmalidir")
            double lat,

            @RequestParam
            @DecimalMin(value = "-180.0", message = "Longitude en az -180 olmalidir")
            @DecimalMax(value = "180.0", message = "Longitude en fazla 180 olmalidir")
            double lng,

            @RequestParam
            @Positive(message = "Radius pozitif olmalidir")
            double radius
    ) {
        return productStockService.getStoresByProductId(productId, lat, lng, radius);
    }
}
