package com.turkcell.stock_service.domain.model;

public record Store(
        Long id,
        String name,
        String address,
        String city,
        String district,
        double latitude,
        double longitude,
        StoreType type,
        String phone,
        String workingHours
) {

    public Store {
        if (id == null) {
            throw new IllegalArgumentException("store id cannot be null");
        }

        if (latitude < -90 || latitude > 90) {
            throw new IllegalArgumentException("store latitude must be between -90 and 90");
        }

        if (longitude < -180 || longitude > 180) {
            throw new IllegalArgumentException("store longitude must be between -180 and 180");
        }

        if (type == null) {
            throw new IllegalArgumentException("store type cannot be null");
        }
    }
}
