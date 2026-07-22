//
//  DealerModels.swift
//  pasaj
//
//  API contract: dealer-map-integration/docs/api-contract.md
//

import Foundation

enum StoreType: String, Codable, Hashable {
    case TIM
    case FRANCHISE
}

enum StockLevel: String, Codable {
    case IN_STOCK
    case LOW
    case OUT_OF_STOCK
}

enum CapabilityType: String, Codable, CaseIterable, Hashable {
    case NEW_LINE
    case DEVICE_DELIVERY
    case DEVICE_REPAIR
    case NUMBER_PORT
    case BILL_PAYMENT
}

struct Store: Codable, Identifiable {
    let id: Int
    let name: String
    let address: String
    let city: String
    let district: String
    let latitude: Double
    let longitude: Double
    let type: StoreType
    let phone: String
    let workingHours: String
}

// GET /products/{id}/stores ve GET /capabilities/{type}/stores dönüşü.
// stockLevel yalnızca stock-service sorgusunda dolu gelir (capability sorgusunda alan hiç gelmez).
struct StoreWithDistance: Codable, Identifiable {
    let id: Int
    let name: String
    let address: String
    let city: String
    let district: String
    let latitude: Double
    let longitude: Double
    let type: StoreType
    let phone: String
    let workingHours: String
    let distance: Double
    let stockLevel: StockLevel?
}

struct Product: Codable, Identifiable, Hashable {
    let id: Int
    let name: String
    let sku: String
    let category: String
}

// GET /capabilities/types dönüşü — düz string değil, {key,label} objesi.
struct CapabilityTypeOption: Codable, Identifiable, Hashable {
    let key: CapabilityType
    let label: String

    var id: CapabilityType { key }
}

struct ApiError: Codable, Error, LocalizedError {
    let status: Int
    let message: String
    let timestamp: String

    var errorDescription: String? { message }
}
