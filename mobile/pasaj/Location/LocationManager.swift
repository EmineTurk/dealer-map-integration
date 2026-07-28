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

    // İlk açılışta konum henüz gelmemişken haritanın yanlışlıkla İstanbul'da açılmasını
    // önlemek için: gerçek konum gelene kadar kısa bir süre bekler. İzin verilmediyse ya da
    // konum bu süre içinde gelmezse (ör. simülatörde konum kapalıysa) İstanbul'a düşer.
    func resolvedLocation(timeout: TimeInterval = 2.0) async -> CLLocationCoordinate2D {
        let deadline = Date().addingTimeInterval(timeout)
        while userLocation == nil && Date() < deadline {
            try? await Task.sleep(nanoseconds: 100_000_000)
        }
        return userLocation ?? LocationManager.istanbulFallback
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
