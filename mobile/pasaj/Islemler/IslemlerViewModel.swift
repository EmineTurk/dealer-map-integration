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
    // Backend'de henüz yok (api-contract.md: "Week 2" notu) — arayüz hazır, filtre bağlanmayı bekliyor.
    var workingHoursFilter: WorkingHoursFilter = .all

    var allStores: [StoreWithDistance] = []
    var isLoadingOptions = false
    var isLoadingStores = false
    var errorMessage: String?
    var hasSearched = false

    var filteredStores: [StoreWithDistance] {
        guard let storeTypeFilter else { return allStores }
        return allStores.filter { $0.type == storeTypeFilter }
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
            allStores = try await AppEnvironment.apiClient.fetchStores(
                forCapability: selectedCapability.key,
                lat: coordinate.latitude,
                lng: coordinate.longitude,
                radius: 15
            )
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoadingStores = false
    }
}
