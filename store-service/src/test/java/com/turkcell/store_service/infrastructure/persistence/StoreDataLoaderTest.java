package com.turkcell.store_service.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;

import com.turkcell.store_service.domain.model.StoreStatus;

class StoreDataLoaderTest {

	@Test
	void shouldCreateOneHundredUniqueActiveStores() {
		var stores = StoreDataLoader.seedStores();

		assertThat(stores).hasSize(100);
		assertThat(stores)
				.extracting(StoreEntity::getId)
				.doesNotHaveDuplicates()
				.containsExactlyInAnyOrderElementsOf(
						java.util.stream.LongStream.rangeClosed(1, 100).boxed().toList());
		assertThat(stores)
				.extracting(StoreEntity::getStatus)
				.containsOnly(StoreStatus.ACTIVE);
		assertThat(stores.stream()
				.map(StoreEntity::getDistrict)
				.collect(java.util.stream.Collectors.toSet()))
				.hasSize(39);
		assertThat(stores.stream()
				.collect(java.util.stream.Collectors.groupingBy(
						StoreEntity::getDistrict,
						java.util.stream.Collectors.counting()))
				.values())
				.allMatch(count -> count >= 2 && count <= 3);
	}

	@Test
	void shouldKeepStoresInTheSameDistrictAtLeastTwoHundredFiftyMetersApart() {
		var storesByDistrict = StoreDataLoader.seedStores().stream()
				.collect(Collectors.groupingBy(StoreEntity::getDistrict));

		assertThat(storesByDistrict.values())
				.allSatisfy(stores -> assertThat(minimumPairDistanceKm(stores))
						.isGreaterThanOrEqualTo(0.25));
	}

	private static double minimumPairDistanceKm(List<StoreEntity> stores) {
		double minimum = Double.MAX_VALUE;
		for (int first = 0; first < stores.size(); first++) {
			for (int second = first + 1; second < stores.size(); second++) {
				minimum = Math.min(minimum, distanceKm(stores.get(first), stores.get(second)));
			}
		}
		return minimum;
	}

	private static double distanceKm(StoreEntity first, StoreEntity second) {
		double latitudeDistance = Math.toRadians(
				second.getLatitude() - first.getLatitude());
		double longitudeDistance = Math.toRadians(
				second.getLongitude() - first.getLongitude());
		double firstLatitude = Math.toRadians(first.getLatitude());
		double secondLatitude = Math.toRadians(second.getLatitude());
		double haversine = Math.sin(latitudeDistance / 2) * Math.sin(latitudeDistance / 2)
				+ Math.cos(firstLatitude) * Math.cos(secondLatitude)
				* Math.sin(longitudeDistance / 2) * Math.sin(longitudeDistance / 2);
		return 6_371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
	}
}
