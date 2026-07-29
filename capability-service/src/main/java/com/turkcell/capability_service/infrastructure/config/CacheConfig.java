package com.turkcell.capability_service.infrastructure.config;

import java.time.Duration;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

@Configuration
@EnableCaching
public class CacheConfig {

	private static final Duration CAPABILITY_CACHE_TTL = Duration.ofHours(1);

	@Bean
	@ConditionalOnProperty(name = "spring.cache.type", havingValue = "redis", matchIfMissing = true)
	RedisCacheConfiguration redisCacheConfiguration() {
		return RedisCacheConfiguration.defaultCacheConfig()
				.entryTtl(CAPABILITY_CACHE_TTL)
				.disableCachingNullValues()
				.computePrefixWith(cacheName -> "capability-service::" + cacheName + "::")
				.serializeValuesWith(RedisSerializationContext.SerializationPair
						.fromSerializer(new GenericJackson2JsonRedisSerializer()));
	}
}
