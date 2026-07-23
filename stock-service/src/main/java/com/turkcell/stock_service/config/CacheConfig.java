package com.turkcell.stock_service.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.lang.NonNull;

import java.time.Duration;

@Configuration
@EnableCaching
public class CacheConfig implements CachingConfigurer {

    static final Duration PRODUCT_STORE_CACHE_TTL = Duration.ofMinutes(5);

    private static final Logger LOGGER = LoggerFactory.getLogger(CacheConfig.class);

    @Bean
    RedisCacheConfiguration redisCacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(PRODUCT_STORE_CACHE_TTL)
                .disableCachingNullValues()
                .computePrefixWith(cacheName -> "stock-service::" + cacheName + "::")
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer()));
    }

    @Override
    @NonNull
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(
                    @NonNull RuntimeException exception,
                    @NonNull Cache cache,
                    @NonNull Object key
            ) {
                logCacheError("read", exception, cache, key);
            }

            @Override
            public void handleCachePutError(
                    @NonNull RuntimeException exception,
                    @NonNull Cache cache,
                    @NonNull Object key,
                    @NonNull Object value
            ) {
                logCacheError("write", exception, cache, key);
            }

            @Override
            public void handleCacheEvictError(
                    @NonNull RuntimeException exception,
                    @NonNull Cache cache,
                    @NonNull Object key
            ) {
                logCacheError("evict", exception, cache, key);
            }

            @Override
            public void handleCacheClearError(
                    @NonNull RuntimeException exception,
                    @NonNull Cache cache
            ) {
                logCacheError("clear", exception, cache, "all");
            }
        };
    }

    private void logCacheError(
            String operation,
            RuntimeException exception,
            Cache cache,
            Object key
    ) {
        LOGGER.warn(
                "Redis cache {} failed for cache={} key={}; continuing without cache: {}",
                operation,
                cache.getName(),
                key,
                exception.getMessage()
        );
    }
}
