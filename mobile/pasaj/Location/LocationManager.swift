//
//  LocationManager.swift
//  pasaj
//

import CoreLocation
import Observation

@Observable
final class LocationManager: NSObject, CLLocationManagerDelegate {
    // Konum izni verilmezse ya da henüz alınamadıysa haritayı burada ortala (B planı).
    static let istanbulFallback = CLLocationCoordinate2D(latitude: 41.0082, longitude: 28.9784)

    private let manager = CLLocationManager()

    var userLocation: CLLocationCoordinate2D?
    var authorizationStatus: CLAuthorizationStatus

    override init() {
        authorizationStatus = manager.authorizationStatus
        super.init()
        manager.delegate = self
    }

    func requestPermission() {
        manager.requestWhenInUseAuthorization()
    }

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        authorizationStatus = manager.authorizationStatus
        if authorizationStatus == .authorizedWhenInUse || authorizationStatus == .authorizedAlways {
            manager.requestLocation()
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        userLocation = locations.first?.coordinate
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Konum alınamadı: \(error)")
    }
}
