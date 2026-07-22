package com.turkcell.stock_service.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@ConfigurationProperties(prefix = "clients.store-service")
@Validated
public record StoreServiceProperties(
        @NotBlank String baseUrl,
        @NotNull Duration connectTimeout,
        @NotNull Duration readTimeout
) {
}
