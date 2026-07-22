package com.turkcell.stock_service.config;

import com.turkcell.stock_service.domain.service.DistanceCalculator;
import com.turkcell.stock_service.domain.service.StockLevelPolicy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DomainServiceConfig {

    @Bean
    public DistanceCalculator distanceCalculator() {
        return new DistanceCalculator();
    }

    @Bean
    public StockLevelPolicy stockLevelPolicy() {
        return new StockLevelPolicy();
    }
}
