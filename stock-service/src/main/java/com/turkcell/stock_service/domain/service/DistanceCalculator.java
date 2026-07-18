package com.turkcell.stock_service.domain.service;

import org.springframework.stereotype.Component;

@Component
public class DistanceCalculator {

    private static final double EARTH_RADIUS_KM = 6371.0;

    public double calculate(
            double userLatitude,    
            double userLongitude,
            double storeLatitude,
            double storeLongitude
    ) {
        double latitudeDistance =
                Math.toRadians(storeLatitude - userLatitude);

        double longitudeDistance =
                Math.toRadians(storeLongitude - userLongitude);

        double userLatitudeRadians =
                Math.toRadians(userLatitude);

        double storeLatitudeRadians =
                Math.toRadians(storeLatitude);

        double a =
                Math.sin(latitudeDistance / 2)
                        * Math.sin(latitudeDistance / 2)
                        + Math.cos(userLatitudeRadians)
                        * Math.cos(storeLatitudeRadians)
                        * Math.sin(longitudeDistance / 2)
                        * Math.sin(longitudeDistance / 2);

        double c = 2 * Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
        );

        double distance = EARTH_RADIUS_KM * c;

        return Math.round(distance * 10.0) / 10.0;
    }
}