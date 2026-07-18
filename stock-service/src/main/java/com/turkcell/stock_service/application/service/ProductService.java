package com.turkcell.stock_service.application.service;

import com.turkcell.stock_service.application.dto.ProductResponse;
import com.turkcell.stock_service.application.dto.StockResponse;
import com.turkcell.stock_service.domain.exception.ProductNotFoundException;
import com.turkcell.stock_service.domain.model.StockLevel;
import com.turkcell.stock_service.infrastructure.persistence.ProductEntity;
import com.turkcell.stock_service.infrastructure.persistence.ProductRepository;
import com.turkcell.stock_service.infrastructure.persistence.StockRepository;
import com.turkcell.stock_service.domain.service.DistanceCalculator;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Comparator;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final StockRepository stockRepository;
    private final DistanceCalculator distanceCalculator;


    public ProductService(
            ProductRepository productRepository,
            StockRepository stockRepository,
            DistanceCalculator distanceCalculator

    ) {
        this.productRepository = productRepository;
        this.stockRepository = stockRepository;
        this.distanceCalculator = distanceCalculator;

    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductResponse getProductById(Long id) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        return toResponse(product);
    }

    public List<StockResponse> getStoresByProductId(
            Long productId,
            double lat,
            double lng,
            double radius
    )
    {
        if (!productRepository.existsById(productId)) {
            throw new ProductNotFoundException(productId);
        }

        return stockRepository.findByProductId(productId)
                .stream()
                .map(stock -> {
                    double[] coordinates = getStoreCoordinates(stock.getStoreId());

                    double distance = distanceCalculator.calculate(
                            lat,
                            lng,
                            coordinates[0],
                            coordinates[1]
                    );

                    return new StockResponse(
                            stock.getProductId(),
                            stock.getStoreId(),
                            StockLevel.fromQuantity(stock.getQuantity()),
                            distance
                    );
                })
                .filter(stockResponse -> stockResponse.distance() <= radius)
                .sorted(Comparator.comparingDouble(StockResponse::distance))
                .toList();
    }

    private ProductResponse toResponse(ProductEntity product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSku(),
                product.getCategory()
        );
    }

    private double[] getStoreCoordinates(Long storeId) {
        return switch (storeId.intValue()) {
            case 1 -> new double[]{40.9901, 29.0253};
            case 2 -> new double[]{41.0428, 29.0075};
            case 3 -> new double[]{41.0602, 28.9877};
            default -> new double[]{0.0, 0.0};
        };
    }
}