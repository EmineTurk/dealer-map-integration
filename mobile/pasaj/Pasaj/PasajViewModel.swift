//
//  PasajViewModel.swift
//  pasaj
//

import CoreLocation
import Observation

@Observable
final class PasajViewModel {
    var products: [Product] = []
    var searchText: String = ""
    var categoryFilter: String?
    var selectedProduct: Product?
    // nil = tüm sonuçlar gösterilir. Bir şehir seçilirse, mesafe yine kullanıcının gerçek
    // konumundan hesaplanır — sadece sonuçlar o şehre ait bayilerle sınırlanır (uzaktan
    // başka bir şehrin stok durumunu kontrol edebilmek için).
    var selectedCity: TurkishCity?
    var nearbyStores: [StoreWithDistance] = []
    var isLoadingProducts = false
    var isLoadingStores = false
    var errorMessage: String?
    var hasSearched = false

    var categories: [String] {
        Array(Set(products.map(\.category))).sorted()
    }

    // Yazarken canlı öneri listesi için — birden fazla eşleşme varsa kullanıcı hangisini
    // istediğini kendi seçer, biz tahmin etmeyiz.
    var suggestions: [Product] {
        let trimmed = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return [] }
        return products.filter { product in
            let matchesCategory = categoryFilter == nil || product.category == categoryFilter
            let matchesSearch = product.name.localizedCaseInsensitiveContains(trimmed)
            return matchesCategory && matchesSearch
        }
    }

    // Mesafe her zaman kullanıcının gerçek konumundan hesaplanır (o da yoksa İstanbul'a düşer)
    // — şehir seçimi mesafeyi değil, hangi bayilerin sonuçlara gireceğini etkiler.
    private func effectiveCoordinate(userLocation: CLLocationCoordinate2D?) -> CLLocationCoordinate2D {
        userLocation ?? LocationManager.istanbulFallback
    }

    // Şehir seçiliyken yarıçap sınırını pratikte kaldırıyoruz (Dünya'nın en uzak iki noktası
    // bile ~20.000 km) — böylece uzak bir şehirdeki bayiler de sonuçlara girebiliyor, ama
    // gösterilen mesafe hep gerçek.
    private var effectiveRadius: Double {
        selectedCity == nil ? 15 : 20_000
    }

    var filteredStores: [StoreWithDistance] {
        guard let selectedCity else { return nearbyStores }
        return nearbyStores.filter { $0.city == selectedCity.backendName }
    }

    func loadProducts() async {
        isLoadingProducts = true
        errorMessage = nil
        do {
            products = try await AppEnvironment.apiClient.fetchProducts()
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoadingProducts = false
    }

    func selectSuggestion(_ product: Product, userLocation: CLLocationCoordinate2D?) async {
        searchText = product.name
        await fetchStock(for: product, userLocation: userLocation)
    }

    // Sayfa ilk açıldığında, herhangi bir ürüne bağlı olmadan tüm bayileri gösterir
    // (harita boş kalmasın diye) — bir ürün aranınca bunun yerini stok sonucu alır.
    func loadOverview(userLocation: CLLocationCoordinate2D?) async {
        isLoadingStores = true
        errorMessage = nil
        hasSearched = true
        selectedProduct = nil
        let coordinate = effectiveCoordinate(userLocation: userLocation)
        do {
            let stores = try await AppEnvironment.apiClient.fetchAllStores(
                lat: coordinate.latitude,
                lng: coordinate.longitude,
                radius: effectiveRadius
            )
            nearbyStores = await RouteDistanceCalculator.applyRouteDistances(to: stores, from: coordinate)
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoadingStores = false
    }

    // "Ara" butonu / klavyede arama tuşu: yalnızca tek eşleşme varsa otomatik gösterir.
    // Birden fazla eşleşme varsa tahmin etmez — kullanıcı öneri listesinden seçmeli.
    func search(userLocation: CLLocationCoordinate2D?) async {
        let matches = suggestions
        hasSearched = true
        selectedProduct = nil

        if matches.count == 1, let onlyMatch = matches.first {
            // Burada nearbyStores'u boşaltmıyoruz: eski sonuçlar ekranda kalıp yeni sonuçlar
            // gelince direkt yerini alsın — harita da eski kutudan yeniye tek seferde geçsin,
            // aradaki "önce kullanıcı konumuna sıkış, sonra büyü" ara adımını atlasın.
            await fetchStock(for: onlyMatch, userLocation: userLocation)
        } else if matches.isEmpty {
            nearbyStores = []
            errorMessage = "Eşleşen ürün bulunamadı"
        } else {
            nearbyStores = []
            errorMessage = "Birden fazla ürün eşleşti — listeden birini seç"
        }
    }

    private func fetchStock(for product: Product, userLocation: CLLocationCoordinate2D?) async {
        selectedProduct = product
        hasSearched = true
        isLoadingStores = true
        errorMessage = nil
        let coordinate = effectiveCoordinate(userLocation: userLocation)
        do {
            let stores = try await AppEnvironment.apiClient.fetchStores(
                forProduct: product.id,
                lat: coordinate.latitude,
                lng: coordinate.longitude,
                radius: effectiveRadius
            )
            nearbyStores = await RouteDistanceCalculator.applyRouteDistances(to: stores, from: coordinate)
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoadingStores = false
    }
}
