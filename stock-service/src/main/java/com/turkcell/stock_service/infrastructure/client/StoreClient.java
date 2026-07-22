package com.turkcell.stock_service.infrastructure.client;

import com.turkcell.stock_service.application.port.out.StoreQueryPort;
import com.turkcell.stock_service.domain.exception.StoreServiceUnavailableException;
import com.turkcell.stock_service.domain.model.Store;
import com.turkcell.stock_service.infrastructure.client.dto.StoreClientResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class StoreClient implements StoreQueryPort {

    private static final Logger LOGGER = LoggerFactory.getLogger(StoreClient.class);

    private final RestClient restClient;

    public StoreClient(RestClient storeServiceRestClient) {
        this.restClient = storeServiceRestClient;
    }

    @Override
    public List<Store> getStoresByIds(List<Long> storeIds) {
        if (storeIds.isEmpty()) {
            return List.of();
        }

        try {
            String ids = storeIds.stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(","));

            List<StoreClientResponse> response = restClient.get()
                    .uri("/stores?ids={ids}", ids)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });

            if (response == null) {
                LOGGER.warn("Store service returned an empty response body");
                throw new StoreServiceUnavailableException();
            }

            return response.stream()
                    .map(this::toDomain)
                    .toList();

        } catch (RestClientException | IllegalArgumentException exception) {
            LOGGER.warn("Store service request failed: {}", exception.getMessage());
            throw new StoreServiceUnavailableException(exception);
        }
    }

    private Store toDomain(StoreClientResponse response) {
        if (response == null
                || response.id() == null
                || response.latitude() == null
                || response.longitude() == null
                || response.type() == null) {
            throw new IllegalArgumentException("Store service returned invalid store data");
        }

        return new Store(
                response.id(),
                response.name(),
                response.address(),
                response.city(),
                response.district(),
                response.latitude(),
                response.longitude(),
                response.type(),
                response.phone(),
                response.workingHours()
        );
    }
}
