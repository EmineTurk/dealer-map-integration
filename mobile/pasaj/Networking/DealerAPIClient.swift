//
//  DealerAPIClient.swift
//  pasaj
//
//

import Foundation

protocol DealerAPIClient {
    func fetchProducts() async throws -> [Product]
    
    func fetchAllStores(lat: Double, lng: Double, radius: Double) async throws -> [StoreWithDistance]
    func fetchStores(forProduct productId: Int, lat: Double, lng: Double, radius: Double) async throws -> [StoreWithDistance]
    func fetchCapabilityTypes() async throws -> [CapabilityTypeOption]
    func fetchStores(forCapability type: CapabilityType, lat: Double, lng: Double, radius: Double) async throws -> [StoreWithDistance]
    func fetchStores(ids: [Int]) async throws -> [Store]
    
    func subscribeToStockNotification(productId: Int, storeId: Int, email: String?, phone: String?) async throws
}
