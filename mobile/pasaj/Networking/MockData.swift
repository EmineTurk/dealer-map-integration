//
//  MockData.swift
//  pasaj
//
//  API contract'taki tiplere uygun sahte veri — backend hazır olmadan
//  UI geliştirmeye devam etmek için.
//

import Foundation

extension StoreWithDistance {
    init(store: Store, distance: Double, stockLevel: StockLevel?) {
        self.init(
            id: store.id,
            name: store.name,
            address: store.address,
            city: store.city,
            district: store.district,
            latitude: store.latitude,
            longitude: store.longitude,
            type: store.type,
            phone: store.phone,
            workingHours: store.workingHours,
            distance: distance,
            stockLevel: stockLevel
        )
    }
}

enum MockData {
    static let products: [Product] = [
        Product(id: 1, name: "iPhone 15 128GB", sku: "IP15-128-BLK", category: "Telefon"),
        Product(id: 2, name: "iPhone 15 Pro 256GB", sku: "IP15P-256-TIT", category: "Telefon"),
        Product(id: 3, name: "Samsung Galaxy S24 128GB", sku: "SGS24-128-BLK", category: "Telefon"),
        Product(id: 4, name: "Samsung Galaxy A55 128GB", sku: "SGA55-128-BLU", category: "Telefon"),
        Product(id: 5, name: "AirPods Pro 2", sku: "APP2-WHT", category: "Aksesuar"),
        Product(id: 6, name: "iPad 10.9\" Wi-Fi 64GB", sku: "IPAD-64-SLV", category: "Tablet"),
        Product(id: 7, name: "Xiaomi Redmi Note 13", sku: "XRN13-128-GRN", category: "Telefon"),
        Product(id: 8, name: "Apple Watch SE", sku: "AWSE-40-BLK", category: "Aksesuar"),
    ]

    static let stores: [Store] = [
        Store(id: 1, name: "Turkcell Kadıköy TİM", address: "Bahariye Cd. No:12", city: "İstanbul", district: "Kadıköy", latitude: 40.9838, longitude: 29.0297, type: .TIM, phone: "0216 555 01 01", workingHours: "09:00-20:00"),
        Store(id: 2, name: "Turkcell Beşiktaş TİM", address: "Barbaros Blv. No:45", city: "İstanbul", district: "Beşiktaş", latitude: 41.0422, longitude: 29.0067, type: .TIM, phone: "0212 555 02 02", workingHours: "09:00-20:00"),
        Store(id: 3, name: "Turkcell Üsküdar Bayi", address: "Hakimiyeti Milliye Cd. No:8", city: "İstanbul", district: "Üsküdar", latitude: 41.0234, longitude: 29.0151, type: .FRANCHISE, phone: "0216 555 03 03", workingHours: "10:00-19:00"),
        Store(id: 4, name: "Turkcell Şişli TİM", address: "Halaskargazi Cd. No:100", city: "İstanbul", district: "Şişli", latitude: 41.0602, longitude: 28.9877, type: .TIM, phone: "0212 555 04 04", workingHours: "09:00-20:00"),
        Store(id: 5, name: "Turkcell Maltepe Bayi", address: "Bağdat Cd. No:210", city: "İstanbul", district: "Maltepe", latitude: 40.9354, longitude: 29.1306, type: .FRANCHISE, phone: "0216 555 05 05", workingHours: "10:00-19:00"),
        Store(id: 6, name: "Turkcell Bakırköy TİM", address: "İstasyon Cd. No:33", city: "İstanbul", district: "Bakırköy", latitude: 40.9819, longitude: 28.8772, type: .TIM, phone: "0212 555 06 06", workingHours: "09:00-20:00"),
        Store(id: 7, name: "Turkcell Ataşehir Bayi", address: "Atatürk Mah. No:15", city: "İstanbul", district: "Ataşehir", latitude: 40.9923, longitude: 29.1244, type: .FRANCHISE, phone: "0216 555 07 07", workingHours: "10:00-19:00"),
        Store(id: 8, name: "Turkcell Beyoğlu TİM", address: "İstiklal Cd. No:150", city: "İstanbul", district: "Beyoğlu", latitude: 41.0361, longitude: 28.9770, type: .TIM, phone: "0212 555 08 08", workingHours: "09:00-21:00"),
    ]

    static let capabilityTypeOptions: [CapabilityTypeOption] = [
        CapabilityTypeOption(key: .NEW_LINE, label: "New Line Application"),
        CapabilityTypeOption(key: .DEVICE_DELIVERY, label: "Device Delivery"),
        CapabilityTypeOption(key: .DEVICE_REPAIR, label: "Device Repair / Technical Service"),
        CapabilityTypeOption(key: .NUMBER_PORT, label: "Number Portability"),
        CapabilityTypeOption(key: .BILL_PAYMENT, label: "Bill Payment"),
    ]

    // İşlemler sekmesi (capability sorgusu) için sabit sonuç. stockLevel'ın hepsi bilerek nil:
    // api-contract.md'de StoreCapabilityResult'ta bu alan yok, stok kavramı sadece Pasaj'a özgü.
    static let storesWithDistance: [StoreWithDistance] = [
        StoreWithDistance(store: stores[0], distance: 1.2, stockLevel: nil),
        StoreWithDistance(store: stores[1], distance: 2.8, stockLevel: nil),
        StoreWithDistance(store: stores[2], distance: 3.5, stockLevel: nil),
        StoreWithDistance(store: stores[3], distance: 4.1, stockLevel: nil),
        StoreWithDistance(store: stores[4], distance: 5.6, stockLevel: nil),
        StoreWithDistance(store: stores[5], distance: 6.3, stockLevel: nil),
    ].sorted { $0.distance < $1.distance }

    // Pasaj'ın ilk açılış görünümü: ürün/işlem bağımsız, sadece bayi konumlarını gösterir.
    static let allStoresOverview: [StoreWithDistance] = stores.enumerated().map { index, store in
        StoreWithDistance(store: store, distance: Double(index) * 0.7 + 0.5, stockLevel: nil)
    }.sorted { $0.distance < $1.distance }

    // Pasaj sekmesi: her ürün için farklı bir bayi/stok görünümü üretir (deterministik,
    // gerçek Haversine hesabı değil — sadece mock demo amaçlı).
    static func storesWithDistance(forProductId productId: Int) -> [StoreWithDistance] {
        let levels: [StockLevel] = [.IN_STOCK, .LOW, .OUT_OF_STOCK]
        return stores.enumerated().compactMap { index, store in
            guard (productId + index) % 4 != 0 else { return nil }
            let level = levels[(productId + index) % levels.count]
            let distance = (Double((productId * 3 + index * 7) % 40) / 10) + 0.8
            return StoreWithDistance(store: store, distance: (distance * 10).rounded() / 10, stockLevel: level)
        }
        .sorted { $0.distance < $1.distance }
    }
}
