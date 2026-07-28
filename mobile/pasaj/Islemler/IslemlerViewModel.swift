//
//  IslemlerViewModel.swift
//  pasaj
//

import CoreLocation
import Observation

enum WorkingHoursFilter: String, CaseIterable, Identifiable {
    case all = "Tümü"
    case weekday = "Hafta İçi"
    case weekend = "Hafta Sonu"

    var id: String { rawValue }
}

@Observable
final class IslemlerViewModel {
    var capabilityOptions: [CapabilityTypeOption] = []
    var selectedCapability: CapabilityTypeOption?
    var storeTypeFilter: StoreType?
    // nil = tüm sonuçlar gösterilir. Bir şehir seçilirse, mesafe yine kullanıcının gerçek
    // konumundan hesaplanır — sadece sonuçlar o şehre ait bayilerle sınırlanır (uzaktan
    // başka bir şehrin durumunu kontrol edebilmek için).
    var selectedCity: TurkishCity?
    // Backend'de henüz yok (api-contract.md: "Week 2" notu) — arayüz hazır, filtre bağlanmayı bekliyor.
    var workingHoursFilter: WorkingHoursFilter = .all

    var allStores: [StoreWithDistance] = []
    var isLoadingOptions = false
    var isLoadingStores = false
    var errorMessage: String?
    var hasSearched = false

    // Şehir seçiliyken yarıçap sınırını pratikte kaldırıyoruz (Dünya'nın en uzak iki noktası
    // bile ~20.000 km) — böylece uzak bir şehirdeki bayiler de sonuçlara girebiliyor, ama
    // gösterilen mesafe hep gerçek.
    private var effectiveRadius: Double {
        selectedCity == nil ? 15 : 20_000
    }

    var filteredStores: [StoreWithDistance] {
        var result = allStores
        if let storeTypeFilter {
            result = result.filter { $0.type == storeTypeFilter }
        }
        if let selectedCity {
            result = result.filter { $0.city == selectedCity.backendName }
        }
        return result
    }

    func loadOptions() async {
        isLoadingOptions = true
        errorMessage = nil
        do {
            capabilityOptions = try await AppEnvironment.apiClient.fetchCapabilityTypes()
            if selectedCapability == nil {
                selectedCapability = capabilityOptions.first
            }
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoadingOptions = false
    }

    func search(userLocation: CLLocationCoordinate2D?) async {
        guard let selectedCapability else { return }
        isLoadingStores = true
        errorMessage = nil
        hasSearched = true
        let coordinate = userLocation ?? LocationManager.istanbulFallback
        do {
            let stores = try await AppEnvironment.apiClient.fetchStores(
                forCapability: selectedCapability.key,
                lat: coordinate.latitude,
                lng: coordinate.longitude,
                radius: effectiveRadius
            )
            allStores = await RouteDistanceCalculator.applyRouteDistances(to: stores, from: coordinate)
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoadingStores = false
    }
}
