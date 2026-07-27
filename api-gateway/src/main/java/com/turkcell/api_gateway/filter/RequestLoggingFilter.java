package com.turkcell.api_gateway.filter;

import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@Component
public class RequestLoggingFilter implements GlobalFilter, Ordered {

	public static final String CORRELATION_ID_HEADER = "X-Correlation-Id";

	private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

	@Override
	public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
		long startedAt = System.currentTimeMillis();
		String correlationId = Optional.ofNullable(
						exchange.getRequest().getHeaders().getFirst(CORRELATION_ID_HEADER))
				.filter(value -> !value.isBlank())
				.orElseGet(() -> UUID.randomUUID().toString());

		ServerHttpRequest request = exchange.getRequest()
				.mutate()
				.headers(headers -> headers.set(CORRELATION_ID_HEADER, correlationId))
				.build();

		exchange.getResponse().getHeaders().set(CORRELATION_ID_HEADER, correlationId);

		return chain.filter(exchange.mutate().request(request).build())
				.doFinally(signalType -> {
					int status = exchange.getResponse().getStatusCode() == null
							? 0
							: exchange.getResponse().getStatusCode().value();
					long durationMs = System.currentTimeMillis() - startedAt;

					log.info(
							"gateway_request correlationId={} method={} path={} status={} durationMs={}",
							correlationId,
							request.getMethod(),
							request.getURI().getRawPath(),
							status,
							durationMs);
				});
	}

	@Override
	public int getOrder() {
		return Ordered.HIGHEST_PRECEDENCE;
	}
}
