//
//  AppEnvironment.swift
//  pasaj
//

import Foundation

enum AppEnvironment {
    // Backend hazır olduğunda tek satır değiştir: LiveAPIClient.shared
    static let apiClient: DealerAPIClient = MockAPIClient()
}
