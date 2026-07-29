package com.turkcell.store_service.infrastructure.persistence;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.turkcell.store_service.domain.model.StoreStatus;
import com.turkcell.store_service.domain.model.StoreType;

/**
 * Seeds STORE table when empty (Oracle init volume may already have schema).
 */
@Component
public class StoreDataLoader implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(StoreDataLoader.class);

	private final StoreJpaRepository storeRepository;

	public StoreDataLoader(StoreJpaRepository storeRepository) {
		this.storeRepository = storeRepository;
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		long currentCount = storeRepository.count();
		List<StoreEntity> desiredStores = seedStores();
		log.info("Synchronizing STORE seed: current={}, desired={}", currentCount, desiredStores.size());
		storeRepository.saveAll(desiredStores);
		log.info("STORE seed synchronized with {} ACTIVE Istanbul dealers", storeRepository.count());
	}

	static List<StoreEntity> seedStores() {
		String[] districts = {
				"Adalar", "Arnavutkoy", "Atasehir", "Avcilar", "Bagcilar",
				"Bahcelievler", "Bakirkoy", "Basaksehir", "Bayrampasa", "Besiktas",
				"Beykoz", "Beylikduzu", "Beyoglu", "Buyukcekmece", "Catalca",
				"Cekmekoy", "Esenler", "Esenyurt", "Eyupsultan", "Fatih",
				"Gaziosmanpasa", "Gungoren", "Kadikoy", "Kagithane", "Kartal",
				"Kucukcekmece", "Maltepe", "Pendik", "Sancaktepe", "Sariyer",
				"Sile", "Silivri", "Sisli", "Sultanbeyli", "Sultangazi",
				"Tuzla", "Umraniye", "Uskudar", "Zeytinburnu"
		};
		double[][] districtCenters = {
				{40.8747, 29.1294}, {41.1856, 28.7407}, {40.9833, 29.1278},
				{40.9799, 28.7211}, {41.0390, 28.8567}, {40.9979, 28.8506},
				{40.9804, 28.8724}, {41.1076, 28.8062}, {41.0482, 28.9003},
				{41.0422, 29.0083}, {41.1342, 29.0920}, {41.0030, 28.6410},
				{41.0369, 28.9773}, {41.0201, 28.5850}, {41.1437, 28.4618},
				{41.0324, 29.1755}, {41.0436, 28.8760}, {41.0343, 28.6801},
				{41.0478, 28.9337}, {41.0193, 28.9479}, {41.0759, 28.9120},
				{41.0229, 28.8723}, {40.9910, 29.0288}, {41.0810, 28.9730},
				{40.8897, 29.1856}, {41.0002, 28.7809}, {40.9351, 29.1307},
				{40.8775, 29.2333}, {41.0024, 29.2319}, {41.1667, 29.0573},
				{41.1754, 29.6120}, {41.0732, 28.2464}, {41.0602, 28.9877},
				{40.9684, 29.2618}, {41.1065, 28.8683}, {40.8168, 29.3003},
				{41.0161, 29.1248}, {41.0267, 29.0152}, {40.9905, 28.8961}
		};
		String[] workingHours = {
				"09:00 - 21:00", "09:00 - 20:00", "10:00 - 22:00", "10:00 - 20:00"
		};
		List<StoreEntity> stores = new ArrayList<>(100);

		for (long id = 1; id <= 100; id++) {
			int districtIndex = (int) ((id - 1) % districts.length);
			int branchNumber = (int) ((id - 1) / districts.length) + 1;
			String district = districts[districtIndex];
			StoreType type = id % 3 == 0 ? StoreType.TIM : StoreType.FRANCHISE;
			// Keep generated dealers close to the verified district center so coastal
			// districts do not drift into the sea while pins remain distinguishable.
			double latitudeOffset = (((id * 37) % 13) - 6) * 0.00004;
			double longitudeOffset = (((id * 53) % 17) - 8) * 0.00005;

			stores.add(store(
					id,
					"Turkcell " + district + " " + (type == StoreType.TIM ? "TIM " : "Franchise ") + branchNumber,
					district + " Merkez Cd. No: " + id + ", " + district,
					"Istanbul",
					district,
					districtCenters[districtIndex][0] + latitudeOffset,
					districtCenters[districtIndex][1] + longitudeOffset,
					type,
					String.format("+90 212 555 %04d", 100 + id),
					workingHours[(int) (id % workingHours.length)],
					StoreStatus.ACTIVE,
					id % 4 != 0
			));
		}

		return List.copyOf(stores);
	}

	private static StoreEntity store(
			Long id, String name, String address, String city, String district,
			double lat, double lng, StoreType type, String phone, String hours,
			StoreStatus status, boolean opensWeekend) {
		StoreEntity e = new StoreEntity();
		e.setId(id);
		e.setName(name);
		e.setAddress(address);
		e.setCity(city);
		e.setDistrict(district);
		e.setLatitude(lat);
		e.setLongitude(lng);
		e.setType(type);
		e.setPhone(phone);
		e.setWorkingHours(hours);
		e.setStatus(status);
		e.setOpensWeekend(opensWeekend);
		return e;
	}
}
