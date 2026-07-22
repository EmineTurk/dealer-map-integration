package com.turkcell.stock_service.domain.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DistanceCalculatorTest {

    private final DistanceCalculator distanceCalculator = new DistanceCalculator();

    @Test
    void shouldReturnZeroWhenCoordinatesAreSame() {
        double distance = distanceCalculator.calculate(
                41.0082,
                28.9784,
                41.0082,
                28.9784
        );

        assertThat(distance).isZero();
    }

    @Test
    void shouldCalculateDistanceRoundedToOneDecimal() {
        double distance = distanceCalculator.calculate(
                41.0082,
                28.9784,
                39.9334,
                32.8597
        );

        assertThat(distance).isEqualTo(349.4);
    }
}
