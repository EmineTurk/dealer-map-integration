//
//  MockAPIClient.swift
//  pasaj
//

import Foundation

final class MockAPIClient: DealerAPIClient {
    private let simulatedDelayNanoseconds: UInt64 = 400_000_000

    func fetchProducts() async throws -> [Product] {
        try await Task.sleep(nanoseconds: simulatedDelayNanoseconds)
        return MockData.products
    }

    func fetchAllStores(lat: Double, lng: Double, radius: Double) async throws -> [StoreWithDistance] {
        try await Task.sleep(nanoseconds: simulatedDelayNanoseconds)
        return MockData.allStoresOverview(lat: lat, lng: lng, radius: radius)
    }

    func fetchStores(forProduct productId: Int, lat: Double, lng: Double, radius: Double) async throws -> [StoreWithDistance] {
        try await Task.sleep(nanoseconds: simulatedDelayNanoseconds)
        return MockData.storesWithDistance(forProductId: productId, lat: lat, lng: lng, radius: radius)
    }

    func fetchCapabilityTypes() async throws -> [CapabilityTypeOption] {
        try await Task.sleep(nanoseconds: simulatedDelayNanoseconds)
        return MockData.capabilityTypeOptions
    }

    func fetchStores(forCapability type: CapabilityType, lat: Double, lng: Double, radius: Double) async throws -> [StoreWithDistance] {
        try await Task.sleep(nanoseconds: simulatedDelayNanoseconds)
        return MockData.storesWithDistance(lat: lat, lng: lng, radius: radius)
    }

    func fetchStores(ids: [Int]) async throws -> [Store] {
        try await Task.sleep(nanoseconds: simulatedDelayNanoseconds)
        return MockData.stores.filter { ids.contains($0.id) }
    }

    func subscribeToStockNotification(productId: Int, storeId: Int, email: String?, phone: String?) async throws {
        try await Task.sleep(nanoseconds: simulatedDelayNanoseconds)
        // Mock: gerçekte e-posta/SMS göndermiyor, sadece kaydı başarılı simüle ediyor.
    }
}
