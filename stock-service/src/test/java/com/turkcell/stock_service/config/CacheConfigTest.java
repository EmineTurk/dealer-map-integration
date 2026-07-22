package com.turkcell.stock_service.config;

import com.turkcell.stock_service.application.dto.ProductResponse;
import org.junit.jupiter.api.Test;
import org.springframework.cache.Cache;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;

import java.util.ArrayList;
import java.time.Duration;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CacheConfigTest {

    private final CacheConfig cacheConfig = new CacheConfig();

    @Test
    void shouldConfigureOneHourProductCacheWithServicePrefix() {
        RedisCacheConfiguration configuration = cacheConfig.redisCacheConfiguration();

        assertThat(configuration.getTtlFunction().getTimeToLive("all", null))
                .isEqualTo(Duration.ofHours(1));
        assertThat(configuration.getAllowCacheNullValues()).isFalse();
        assertThat(configuration.getKeyPrefixFor("products"))
                .isEqualTo("stock-service::products::");
    }

    @Test
    void shouldContinueWhenRedisReadFails() {
        Cache cache = mock(Cache.class);
        when(cache.getName()).thenReturn("products");
        CacheErrorHandler errorHandler = cacheConfig.errorHandler();

        assertThatCode(() -> errorHandler.handleCacheGetError(
                new IllegalStateException("Redis unavailable"),
                cache,
                "all"
        )).doesNotThrowAnyException();
    }

    @Test
    void shouldSerializeAndDeserializeProductCatalogAsJson() {
        GenericJackson2JsonRedisSerializer serializer =
                new GenericJackson2JsonRedisSerializer();
        ProductResponse product = new ProductResponse(
                1L,
                "iPhone 15 128GB",
                "APL-IPH15-128",
                "Smartphones"
        );
        ArrayList<ProductResponse> catalog = new ArrayList<>(List.of(product));

        byte[] serializedCatalog = serializer.serialize(catalog);
        Object deserializedCatalog = serializer.deserialize(serializedCatalog);

        assertThat(deserializedCatalog)
                .isInstanceOf(List.class)
                .asList()
                .containsExactly(product);
    }
}
