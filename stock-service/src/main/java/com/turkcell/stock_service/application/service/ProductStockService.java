package com.turkcell.stock_service.application.service;

import com.turkcell.stock_service.application.dto.StockResponse;
import com.turkcell.stock_service.application.port.out.ProductQueryPort;
import com.turkcell.stock_service.application.port.out.StockQueryPort;
import com.turkcell.stock_service.application.port.out.StoreQueryPort;
import com.turkcell.stock_service.domain.exception.ProductNotFoundException;
import com.turkcell.stock_service.domain.model.Stock;
import com.turkcell.stock_service.domain.service.DistanceCalculator;
import com.turkcell.stock_service.domain.service.StockLevelPolicy;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ProductStockService {

    private final ProductQueryPort productQueryPort;
    private final StockQueryPort stockQueryPort;
    private final StoreQueryPort storeQueryPort;
    private final DistanceCalculator distanceCalculator;
    private final StockLevelPolicy stockLevelPolicy;

    public ProductStockService(
            ProductQueryPort productQueryPort,
            StockQueryPort stockQueryPort,
            StoreQueryPort storeQueryPort,
            DistanceCalculator distanceCalculator,
            StockLevelPolicy stockLevelPolicy
    ) {
        this.productQueryPort = productQueryPort;
        this.stockQueryPort = stockQueryPort;
        this.storeQueryPort = storeQueryPort;
        this.distanceCalculator = distanceCalculator;
        this.stockLevelPolicy = stockLevelPolicy;
    }

    public List<StockResponse> getStoresByProductId(
            Long productId,
            double latitude,
            double longitude,
            double radius
    ) {
        if (!productQueryPort.existsById(productId)) {
            throw new ProductNotFoundException(productId);
        }

        List<Stock> availableStocks = stockQueryPort.findByProductId(productId)
                .stream()
                .filter(stock -> stock.getQuantity() > 0)
                .toList();

        if (availableStocks.isEmpty()) {
            return List.of();
        }

        Map<Long, Stock> stockByStoreId = availableStocks.stream()
                .collect(Collectors.toMap(Stock::getStoreId, Function.identity()));

        List<Long> storeIds = availableStocks.stream()
                .map(Stock::getStoreId)
                .toList();

        return storeQueryPort.getStoresByIds(storeIds)
                .stream()
                .filter(store -> stockByStoreId.containsKey(store.id()))
                .map(store -> {
                    Stock stock = stockByStoreId.get(store.id());
                    double distance = distanceCalculator.calculate(
                            latitude,
                            longitude,
                            store.latitude(),
                            store.longitude()
                    );

                    return new StockResponse(
                            store.id(),
                            store.name(),
                            store.address(),
                            store.city(),
                            store.district(),
                            store.latitude(),
                            store.longitude(),
                            store.type(),
                            store.phone(),
                            store.workingHours(),
                            distance,
                            stockLevelPolicy.determine(stock.getQuantity())
                    );
                })
                .filter(stockResponse -> stockResponse.distance() <= radius)
                .sorted(Comparator.comparingDouble(StockResponse::distance))
                .toList();
    }
}
