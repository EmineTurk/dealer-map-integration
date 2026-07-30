package com.turkcell.capability_service.domain.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

/**
 * Gün 18 — Haversine geo birim testleri (domain, bağımlılık yok).
 */
class DistanceCalculatorTest {

	private final DistanceCalculator calculator = new DistanceCalculator();

	@Test
	void samePoint_isZero() {
		assertThat(calculator.calculate(41.0, 29.0, 41.0, 29.0)).isZero();
	}

	@Test
	void roundsToOneDecimalPlace() {
		double km = calculator.calculate(41.0082, 28.9784, 39.9334, 32.8597);
		assertThat(km).isEqualTo(349.4);
		assertThat(km * 10 % 1).isZero();
	}

	@Test
	void kadikoyToBesiktas_isReasonable() {
		double km = calculator.calculate(40.9901, 29.0253, 41.0428, 29.0075);
		assertThat(km).isBetween(4.0, 8.0);
	}

	@Test
	void isSymmetric() {
		double a = calculator.calculate(40.9901, 29.0253, 41.0602, 28.9877);
		double b = calculator.calculate(41.0602, 28.9877, 40.9901, 29.0253);
		assertThat(a).isEqualTo(b);
	}

	@ParameterizedTest(name = "lat delta {0} → distance within radius gate")
	@CsvSource({
			"0.01, 2.0, true",
			"0.05, 2.0, false",
			"0.02, 5.0, true"
	})
	void radiusGateMatchesExpected(double latDelta, double radiusKm, boolean inside) {
		double distance = calculator.calculate(41.0, 29.0, 41.0 + latDelta, 29.0);
		assertThat(distance <= radiusKm).isEqualTo(inside);
	}
}
