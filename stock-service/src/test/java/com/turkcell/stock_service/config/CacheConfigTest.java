package com.turkcell.stock_service.config;

import com.turkcell.stock_service.application.dto.StockResponse;
import com.turkcell.stock_service.domain.model.StockLevel;
import com.turkcell.stock_service.domain.model.StoreType;
import org.junit.jupiter.api.Test;
import org.springframework.cache.Cache;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CacheConfigTest {

    private final CacheConfig cacheConfig = new CacheConfig();

    @Test
    void shouldConfigureFiveMinuteProductStoreCacheWithServicePrefix() {
        RedisCacheConfiguration configuration = cacheConfig.redisCacheConfiguration();

        assertThat(configuration.getTtlFunction().getTimeToLive("product-stores", null))
                .isEqualTo(Duration.ofMinutes(5));
        assertThat(configuration.getAllowCacheNullValues()).isFalse();
        assertThat(configuration.getKeyPrefixFor("product-stores"))
                .isEqualTo("stock-service::product-stores::");
    }

    @Test
    void shouldContinueWhenRedisReadFails() {
        Cache cache = mock(Cache.class);
        when(cache.getName()).thenReturn("product-stores");
        CacheErrorHandler errorHandler =
                Objects.requireNonNull(cacheConfig.errorHandler());

        assertThatCode(() -> errorHandler.handleCacheGetError(
                new IllegalStateException("Redis unavailable"),
                cache,
                "1:41.02:29.01:10.0"
        )).doesNotThrowAnyException();
    }

    @Test
    void shouldSerializeAndDeserializeProductStoreResultsAsJson() {
        GenericJackson2JsonRedisSerializer serializer =
                new GenericJackson2JsonRedisSerializer();
        StockResponse stockResponse = new StockResponse(
                10L,
                "Turkcell Kadikoy TIM",
                "Sogutlucesme Cd. No: 42",
                "Istanbul",
                "Kadikoy",
                41.02,
                29.01,
                StoreType.TIM,
                "+90 216 555 0101",
                "09:00 - 21:00",
                0.0,
                StockLevel.IN_STOCK
        );
        ArrayList<StockResponse> results = new ArrayList<>(List.of(stockResponse));

        byte[] serializedResults = serializer.serialize(results);
        Object deserializedResults = serializer.deserialize(serializedResults);

        assertThat(deserializedResults).isInstanceOf(List.class);
        assertThat(deserializedResults).isEqualTo(List.of(stockResponse));
    }
}
