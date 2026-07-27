package com.turkcell.api_gateway.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;

import java.net.InetSocketAddress;

import org.junit.jupiter.api.Test;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;

class RateLimitConfigTest {

	private final RateLimitConfig config = new RateLimitConfig();

	@Test
	void usesRemoteAddressByDefaultAndIgnoresUntrustedForwardedHeader() {
		var request = MockServerHttpRequest.get("/")
				.remoteAddress(new InetSocketAddress("10.0.0.5", 1234))
				.header("X-Forwarded-For", "203.0.113.10")
				.build();

		String key = config.clientIpKeyResolver(0)
				.resolve(MockServerWebExchange.from(request))
				.block();

		assertThat(key).isEqualTo("10.0.0.5");
	}

	@Test
	void usesForwardedAddressWhenTrustedProxyCountIsConfigured() {
		var request = MockServerHttpRequest.get("/")
				.remoteAddress(new InetSocketAddress("10.0.0.5", 1234))
				.header("X-Forwarded-For", "203.0.113.10")
				.build();

		String key = config.clientIpKeyResolver(1)
				.resolve(MockServerWebExchange.from(request))
				.block();

		assertThat(key).isEqualTo("203.0.113.10");
	}

	@Test
	void rejectsNegativeTrustedProxyCount() {
		assertThatIllegalArgumentException()
				.isThrownBy(() -> config.clientIpKeyResolver(-1))
				.withMessage("trusted-proxy-count must be zero or greater");
	}
}
