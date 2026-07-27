package com.turkcell.api_gateway.config;

import java.net.InetAddress;
import java.net.InetSocketAddress;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.support.ipresolver.RemoteAddressResolver;
import org.springframework.cloud.gateway.support.ipresolver.XForwardedRemoteAddressResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import reactor.core.publisher.Mono;

@Configuration
public class RateLimitConfig {

	@Bean
	KeyResolver clientIpKeyResolver(
			@Value("${app.rate-limit.trusted-proxy-count:0}") int trustedProxyCount) {
		if (trustedProxyCount < 0) {
			throw new IllegalArgumentException("trusted-proxy-count must be zero or greater");
		}

		RemoteAddressResolver forwardedResolver = trustedProxyCount == 0
				? null
				: XForwardedRemoteAddressResolver.maxTrustedIndex(trustedProxyCount);

		return exchange -> Mono.justOrEmpty(forwardedResolver == null
						? exchange.getRequest().getRemoteAddress()
						: forwardedResolver.resolve(exchange))
				.map(InetSocketAddress::getAddress)
				.map(InetAddress::getHostAddress)
				.defaultIfEmpty("unknown-client");
	}
}
