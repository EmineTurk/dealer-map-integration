//
//  DealerAPIClient.swift
//  pasaj
//
//  LiveAPIClient (gerçek backend) ve MockAPIClient (mock veri) aynı
//  protokole uyar; ContentView hangisini kullandığını bilmez.
//

import Foundation

protocol DealerAPIClient {
    func fetchProducts() async throws -> [Product]
    // Ürün/işlem bağımsız genel bayi görünümü (harita ilk açılışta boş kalmasın diye).
    // Not: api-contract.md'de "tüm bayileri listele" diye bir endpoint yok, bu yüzden
    // LiveAPIClient bunu desteklemez — yalnızca mock modda çalışır.
    func fetchAllStores() async throws -> [StoreWithDistance]
    func fetchStores(forProduct productId: Int, lat: Double, lng: Double, radius: Double) async throws -> [StoreWithDistance]
    func fetchCapabilityTypes() async throws -> [CapabilityTypeOption]
    func fetchStores(forCapability type: CapabilityType, lat: Double, lng: Double, radius: Double) async throws -> [StoreWithDistance]
    func fetchStores(ids: [Int]) async throws -> [Store]
}
