package com.turkcell.api_gateway;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.cloud.gateway.filter.FilterDefinition;
import org.springframework.cloud.gateway.route.RouteDefinitionLocator;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class GatewayRoutingTest {

	private static final HttpServer stockService = startDownstreamService();
	private static final HttpServer storeService = startDownstreamService();
	private static final HttpServer capabilityService = startDownstreamService();

	@LocalServerPort
	private int gatewayPort;

	private WebTestClient webTestClient;

	@Autowired
	private RouteDefinitionLocator routeDefinitionLocator;

	@BeforeEach
	void configureWebTestClient() {
		webTestClient = WebTestClient.bindToServer()
				.baseUrl("http://localhost:" + gatewayPort)
				.build();
	}

	@AfterAll
	static void stopDownstreamServices() {
		stockService.stop(0);
		storeService.stop(0);
		capabilityService.stop(0);
	}

	@DynamicPropertySource
	static void gatewayProperties(DynamicPropertyRegistry registry) {
		registry.add("STOCK_SERVICE_URI", () -> downstreamUrl(stockService));
		registry.add("STORE_SERVICE_URI", () -> downstreamUrl(storeService));
		registry.add("CAPABILITY_SERVICE_URI", () -> downstreamUrl(capabilityService));
	}

	@Test
	void routesPasajRequestsToStockServiceAndStripsGatewayPrefix() {
		webTestClient.get()
				.uri("/api/pasaj/products?category=phone")
				.header(HttpHeaders.ORIGIN, "http://localhost:5173")
				.header("X-Correlation-Id", "test-correlation-id")
				.exchange()
				.expectStatus().isOk()
				.expectHeader().valueEquals("X-Correlation-Id", "test-correlation-id")
				.expectHeader().value(
						HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS,
						value -> assertThat(value).contains("X-Correlation-Id"))
				.expectBody(String.class)
				.value(body -> assertThat(body).isEqualTo("/products?category=phone"));
	}

	@Test
	void routesStoreRequestsAndKeepsStoresPrefix() {
		webTestClient.get()
				.uri("/api/stores/7")
				.exchange()
				.expectStatus().isOk()
				.expectBody(String.class)
				.value(body -> assertThat(body).isEqualTo("/stores/7"));
	}

	@Test
	void routesCapabilityRequestsAndStripsComtrPrefix() {
		webTestClient.get()
				.uri("/api/comtr/capabilities/types")
				.exchange()
				.expectStatus().isOk()
				.expectBody(String.class)
				.value(body -> assertThat(body).isEqualTo("/capabilities/types"));
	}

	@Test
	void handlesCorsPreflightAtGateway() {
		webTestClient.method(HttpMethod.OPTIONS)
				.uri("/api/pasaj/products")
				.header(HttpHeaders.ORIGIN, "http://localhost:5173")
				.header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET")
				.exchange()
				.expectStatus().isOk()
				.expectHeader().valueEquals(
						HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN,
						"http://localhost:5173")
				.expectHeader().value(
						HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS,
						value -> assertThat(value)
								.contains("GET", "PUT", "OPTIONS")
								.doesNotContain("POST", "DELETE"));
	}

	@Test
	void createsCorrelationIdWhenClientDoesNotSendOne() {
		webTestClient.get()
				.uri("/api/pasaj/products")
				.exchange()
				.expectStatus().isOk()
				.expectHeader().exists("X-Correlation-Id");
	}

	@Test
	void doesNotExposeGatewayActuatorEndpoint() {
		webTestClient.get()
				.uri("/actuator/gateway")
				.exchange()
				.expectStatus().isNotFound();
	}

	@Test
	void appliesRedisRateLimiterOnlyToStockWriteRoute() {
		var routes = routeDefinitionLocator.getRouteDefinitions().collectList().block();

		assertThat(routes).isNotNull();
		var writeRoute = routes.stream()
				.filter(route -> "pasaj-stock-write".equals(route.getId()))
				.findFirst()
				.orElseThrow();

		assertThat(writeRoute.getFilters())
				.extracting(FilterDefinition::getName)
				.containsExactly("StripPrefix", "RequestRateLimiter");

		var readRoute = routes.stream()
				.filter(route -> "pasaj-stock".equals(route.getId()))
				.findFirst()
				.orElseThrow();

		assertThat(readRoute.getFilters())
				.extracting(FilterDefinition::getName)
				.containsExactly("StripPrefix");
	}

	private static String downstreamUrl(HttpServer server) {
		return "http://localhost:" + server.getAddress().getPort();
	}

	private static void respondWithRequestPath(HttpExchange exchange) throws IOException {
		String response = exchange.getRequestURI().toString();
		byte[] body = response.getBytes(StandardCharsets.UTF_8);
		exchange.getResponseHeaders().add("Content-Type", "text/plain");
		exchange.sendResponseHeaders(200, body.length);
		exchange.getResponseBody().write(body);
		exchange.close();
	}

	private static HttpServer startDownstreamService() {
		try {
			HttpServer server = HttpServer.create(new InetSocketAddress(0), 0);
			server.createContext("/", GatewayRoutingTest::respondWithRequestPath);
			server.setExecutor(Executors.newSingleThreadExecutor(runnable -> {
				Thread thread = new Thread(runnable);
				thread.setDaemon(true);
				return thread;
			}));
			server.start();
			return server;
		} catch (IOException exception) {
			throw new IllegalStateException("Could not start downstream test service", exception);
		}
	}
}
