//
//  RouteDistanceCalculator.swift
//  pasaj
//
//  Apple Haritalar'da göreceğin gerçek yol mesafesini hesaplar (kuş uçuşu değil).
//  MockData'daki mesafe önce kuş uçuşu olarak hesaplanıyor (hızlı, arama yarıçapı
//  filtrelemesi için yeterli); bu dosya, ekranda gösterilecek listedeki mesafeyi
//  gerçek rotayla güncelliyor.
//

import CoreLocation
import MapKit

enum RouteDistanceCalculator {
    static func routeDistanceKm(from origin: CLLocationCoordinate2D, to destination: CLLocationCoordinate2D) async -> Double? {
        let request = MKDirections.Request()
        request.source = MKMapItem(placemark: MKPlacemark(coordinate: origin))
        request.destination = MKMapItem(placemark: MKPlacemark(coordinate: destination))
        request.transportType = .automobile

        do {
            let response = try await MKDirections(request: request).calculate()
            guard let meters = response.routes.first?.distance else { return nil }
            return (meters / 1000 * 10).rounded() / 10
        } catch {
            // Rota bulunamazsa kuş uçuşu değeri koruyoruz
            return nil
        }
    }

    // Listedeki her bayi için gerçek yol mesafesini paralel olarak hesaplayıp günceller,
    // sonra mesafeye göre yeniden sıralar.
    static func applyRouteDistances(to stores: [StoreWithDistance], from origin: CLLocationCoordinate2D) async -> [StoreWithDistance] {
        await withTaskGroup(of: (Int, Double?).self) { group in
            for (index, store) in stores.enumerated() {
                group.addTask {
                    let destination = CLLocationCoordinate2D(latitude: store.latitude, longitude: store.longitude)
                    let distance = await routeDistanceKm(from: origin, to: destination)
                    return (index, distance)
                }
            }

            var updated = stores
            for await (index, distance) in group {
                if let distance {
                    updated[index].distance = distance
                }
            }
            return updated.sorted { $0.distance < $1.distance }
        }
    }
}
