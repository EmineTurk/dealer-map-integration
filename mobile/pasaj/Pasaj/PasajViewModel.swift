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
        do {
            nearbyStores = try await AppEnvironment.apiClient.fetchAllStores()
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
        nearbyStores = []

        if matches.count == 1, let onlyMatch = matches.first {
            await fetchStock(for: onlyMatch, userLocation: userLocation)
        } else if matches.isEmpty {
            errorMessage = "Eşleşen ürün bulunamadı"
        } else {
            errorMessage = "Birden fazla ürün eşleşti — listeden birini seç"
        }
    }

    private func fetchStock(for product: Product, userLocation: CLLocationCoordinate2D?) async {
        selectedProduct = product
        hasSearched = true
        isLoadingStores = true
        errorMessage = nil
        let coordinate = userLocation ?? LocationManager.istanbulFallback
        do {
            nearbyStores = try await AppEnvironment.apiClient.fetchStores(
                forProduct: product.id,
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
