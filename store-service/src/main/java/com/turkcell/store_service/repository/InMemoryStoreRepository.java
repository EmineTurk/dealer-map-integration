package com.turkcell.store_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.turkcell.store_service.domain.StoreType;
import com.turkcell.store_service.dto.StoreResponse;

@Repository
public class InMemoryStoreRepository {

	private final List<StoreResponse> stores = List.of(
			new StoreResponse(1L, "Turkcell Kadikoy TIM", "Sogutlucesme Cd. No: 42, Kadikoy", "Istanbul", "Kadikoy",
					40.9901, 29.0253, StoreType.TIM),
			new StoreResponse(2L, "Turkcell Besiktas TIM", "Barbaros Blv. No: 12, Besiktas", "Istanbul", "Besiktas",
					41.0428, 29.0075, StoreType.TIM),
			new StoreResponse(3L, "Turkcell Sisli TIM", "Halaskargazi Cd. No: 150, Sisli", "Istanbul", "Sisli",
					41.0602, 28.9877, StoreType.TIM),
			new StoreResponse(4L, "Turkcell Uskudar TIM", "Hakimiyeti Milliye Cd. No: 80, Uskudar", "Istanbul",
					"Uskudar", 41.0267, 29.0152, StoreType.TIM),
			new StoreResponse(5L, "Turkcell Fatih TIM", "Fevzipasa Cd. No: 210, Fatih", "Istanbul", "Fatih", 41.0186,
					28.9497, StoreType.TIM),
			new StoreResponse(6L, "Turkcell Beyoglu TIM", "Istiklal Cd. No: 75, Beyoglu", "Istanbul", "Beyoglu",
					41.0370, 28.9764, StoreType.TIM),
			new StoreResponse(7L, "Turkcell Kadikoy Franchise 1", "Moda Cd. No: 18, Kadikoy", "Istanbul", "Kadikoy",
					40.9880, 29.0300, StoreType.FRANCHISE),
			new StoreResponse(8L, "Turkcell Besiktas Franchise 1", "Sinanpasa Pasaji No: 5, Besiktas", "Istanbul",
					"Besiktas", 41.0410, 29.0090, StoreType.FRANCHISE),
			new StoreResponse(9L, "Turkcell Sisli Franchise 1", "Abdi Ipekci Cd. No: 45, Nisantasi", "Istanbul",
					"Sisli", 41.0580, 28.9850, StoreType.FRANCHISE),
			new StoreResponse(10L, "Turkcell Uskudar Franchise 1", "Baglarbasi Cd. No: 120, Uskudar", "Istanbul",
					"Uskudar", 41.0250, 29.0120, StoreType.FRANCHISE),
			new StoreResponse(11L, "Turkcell Fatih Franchise 1", "Vatan Cd. No: 33, Fatih", "Istanbul", "Fatih",
					41.0150, 28.9450, StoreType.FRANCHISE),
			new StoreResponse(12L, "Turkcell Kadikoy Franchise 2", "Acibadem Cd. No: 88, Kadikoy", "Istanbul",
					"Kadikoy", 40.9850, 29.0200, StoreType.FRANCHISE),
			new StoreResponse(13L, "Turkcell Besiktas Franchise 2", "Ortakoy Meydan No: 3, Besiktas", "Istanbul",
					"Besiktas", 41.0450, 29.0020, StoreType.FRANCHISE),
			new StoreResponse(14L, "Turkcell Sisli Franchise 2", "Mecidiyekoy Yolu No: 12, Sisli", "Istanbul", "Sisli",
					41.0620, 28.9920, StoreType.FRANCHISE),
			new StoreResponse(15L, "Turkcell Uskudar Franchise 2", "Libadiye Cd. No: 200, Uskudar", "Istanbul",
					"Uskudar", 41.0290, 29.0200, StoreType.FRANCHISE));

	public List<StoreResponse> findAll() {
		return stores;
	}

	public Optional<StoreResponse> findById(Long id) {
		return stores.stream()
				.filter(store -> store.id().equals(id))
				.findFirst();
	}
}
