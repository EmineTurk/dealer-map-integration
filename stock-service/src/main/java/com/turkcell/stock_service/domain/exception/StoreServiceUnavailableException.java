package com.turkcell.stock_service.domain.exception;

public class StoreServiceUnavailableException extends RuntimeException {

    public StoreServiceUnavailableException() {
        super("Store service is unavailable");
    }

    public StoreServiceUnavailableException(Throwable cause) {
        super("Store service is unavailable", cause);
    }
}
