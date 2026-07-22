//
//  MockAPIClient.swift
//  pasaj
//

import Foundation

final class MockAPIClient: DealerAPIClient {
    // Gerçek bir ağ isteği hissi vermesi için küçük bir gecikme (loading state'i test edebilesin diye).
    private let simulatedDelayNanoseconds: UInt64 = 400_000_000

    func fetchProducts() async throws -> [Product] {
        try await Task.sleep(nanoseconds: simulatedDelayNanoseconds)
        return MockData.products
    }

    func fetchAllStores() async throws -> [StoreWithDistance] {
        try await Task.sleep(nanoseconds: simulatedDelayNanoseconds)
        return MockData.allStoresOverview
    }

    func fetchStores(forProduct productId: Int, lat: Double, lng: Double, radius: Double) async throws -> [StoreWithDistance] {
        try await Task.sleep(nanoseconds: simulatedDelayNanoseconds)
        return MockData.storesWithDistance(forProductId: productId)
    }

    func fetchCapabilityTypes() async throws -> [CapabilityTypeOption] {
        try await Task.sleep(nanoseconds: simulatedDelayNanoseconds)
        return MockData.capabilityTypeOptions
    }

    func fetchStores(forCapability type: CapabilityType, lat: Double, lng: Double, radius: Double) async throws -> [StoreWithDistance] {
        try await Task.sleep(nanoseconds: simulatedDelayNanoseconds)
        return MockData.storesWithDistance
    }

    func fetchStores(ids: [Int]) async throws -> [Store] {
        try await Task.sleep(nanoseconds: simulatedDelayNanoseconds)
        return MockData.stores.filter { ids.contains($0.id) }
    }
}
