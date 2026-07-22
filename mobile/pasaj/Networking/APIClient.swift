//
//  APIClient.swift
//  pasaj
//

import Foundation

enum APIConfig {
    // Simülatörde "localhost" çalışır. Gerçek cihazda Mac'inin LAN IP'sini yaz
    // (Terminal'de: ifconfig | grep "inet " -> örn. "192.168.1.34").
    static let host = "localhost"

    static let stockServiceBase = "http://\(host):8080"
    static let storeServiceBase = "http://\(host):8081"
    static let capabilityServiceBase = "http://\(host):8082"
}

final class LiveAPIClient: DealerAPIClient {
    static let shared = LiveAPIClient()

    private let decoder = JSONDecoder()

    private init() {}

    // MARK: - stock-service (Pasaj)

    func fetchProducts() async throws -> [Product] {
        try await get([Product].self, from: "\(APIConfig.stockServiceBase)/products")
    }

    func fetchAllStores() async throws -> [StoreWithDistance] {
        throw ApiError(
            status: 501,
            message: "Backend'de tüm bayileri listeleyen bir endpoint yok (api-contract.md'de tanımlı değil)",
            timestamp: ISO8601DateFormatter().string(from: Date())
        )
    }

    func fetchStores(forProduct productId: Int, lat: Double, lng: Double, radius: Double) async throws -> [StoreWithDistance] {
        let url = "\(APIConfig.stockServiceBase)/products/\(productId)/stores?lat=\(lat)&lng=\(lng)&radius=\(radius)"
        return try await get([StoreWithDistance].self, from: url)
    }

    // MARK: - capability-service (com.tr)

    func fetchCapabilityTypes() async throws -> [CapabilityTypeOption] {
        try await get([CapabilityTypeOption].self, from: "\(APIConfig.capabilityServiceBase)/capabilities/types")
    }

    func fetchStores(forCapability type: CapabilityType, lat: Double, lng: Double, radius: Double) async throws -> [StoreWithDistance] {
        let url = "\(APIConfig.capabilityServiceBase)/capabilities/\(type.rawValue)/stores?lat=\(lat)&lng=\(lng)&radius=\(radius)"
        return try await get([StoreWithDistance].self, from: url)
    }

    // MARK: - store-service (ortak)

    func fetchStores(ids: [Int]) async throws -> [Store] {
        let idsParam = ids.map(String.init).joined(separator: ",")
        return try await get([Store].self, from: "\(APIConfig.storeServiceBase)/stores?ids=\(idsParam)")
    }

    // MARK: - Generic GET

    private func get<T: Decodable>(_ type: T.Type, from urlString: String) async throws -> T {
        guard let url = URL(string: urlString) else {
            throw URLError(.badURL)
        }

        let (data, response) = try await URLSession.shared.data(from: url)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            if let apiError = try? decoder.decode(ApiError.self, from: data) {
                throw apiError
            }
            throw URLError(.badServerResponse)
        }

        return try decoder.decode(T.self, from: data)
    }
}
