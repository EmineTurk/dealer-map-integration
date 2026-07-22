package com.turkcell.stock_service.infrastructure.client;

import com.turkcell.stock_service.domain.exception.StoreServiceUnavailableException;
import com.turkcell.stock_service.domain.model.Store;
import com.turkcell.stock_service.domain.model.StoreType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class StoreClientTest {

    private MockRestServiceServer mockServer;
    private StoreClient storeClient;

    @BeforeEach
    void setUp() {
        RestClient.Builder restClientBuilder = RestClient.builder()
                .baseUrl("http://localhost:8081");
        mockServer = MockRestServiceServer.bindTo(restClientBuilder).build();
        storeClient = new StoreClient(restClientBuilder.build());
    }

    @Test
    void shouldFetchStoresWithSingleBulkRequest() {
        mockServer.expect(requestTo("http://localhost:8081/stores?ids=1%2C2"))
                .andExpect(method(GET))
                .andRespond(withSuccess("""
                        [
                          {
                            "id": 1,
                            "name": "Kadikoy TIM",
                            "address": "Address",
                            "city": "Istanbul",
                            "district": "Kadikoy",
                            "latitude": 40.99,
                            "longitude": 29.02,
                            "type": "TIM",
                            "phone": "+90 216 555 0101",
                            "workingHours": "09:00 - 21:00"
                          }
                        ]
                        """, MediaType.APPLICATION_JSON));

        List<Store> result = storeClient.getStoresByIds(List.of(1L, 2L));

        assertThat(result).singleElement().satisfies(store -> {
            assertThat(store.id()).isEqualTo(1L);
            assertThat(store.type()).isEqualTo(StoreType.TIM);
            assertThat(store.phone()).isEqualTo("+90 216 555 0101");
        });
        mockServer.verify();
    }

    @Test
    void shouldTranslateStoreServiceFailureToDomainException() {
        mockServer.expect(requestTo("http://localhost:8081/stores?ids=1"))
                .andRespond(withServerError());

        assertThatThrownBy(() -> storeClient.getStoresByIds(List.of(1L)))
                .isInstanceOf(StoreServiceUnavailableException.class)
                .hasMessage("Store service is unavailable")
                .hasCauseInstanceOf(RuntimeException.class);

        mockServer.verify();
    }
}
