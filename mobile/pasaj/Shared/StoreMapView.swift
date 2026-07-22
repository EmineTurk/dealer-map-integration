//
//  StoreMapView.swift
//  pasaj
//
//  Pasaj ve İşlemler sekmeleri aynı harita bileşenini paylaşır.
//

import SwiftUI
import MapKit

struct StoreMapView: View {
    let stores: [StoreWithDistance]
    let userLocation: CLLocationCoordinate2D?
    @Binding var selectedStoreId: Int?

    @State private var cameraPosition: MapCameraPosition = .region(
        MKCoordinateRegion(center: LocationManager.istanbulFallback, span: MKCoordinateSpan(latitudeDelta: 0.3, longitudeDelta: 0.3))
    )

    var body: some View {
        Map(position: $cameraPosition, selection: $selectedStoreId) {
            if let userLocation {
                Marker("Konumum", systemImage: "location.fill", coordinate: userLocation)
                    .tint(.blue)
            }
            ForEach(stores) { store in
                Marker(store.name, systemImage: "storefront.fill", coordinate: CLLocationCoordinate2D(latitude: store.latitude, longitude: store.longitude))
                    .tint(pinColor(for: store.stockLevel))
                    .tag(store.id)
            }
        }
        .mapControls {
            MapUserLocationButton()
            MapCompass()
        }
        .onAppear { fitCameraToStores() }
        .onChange(of: stores.map(\.id)) { _, _ in fitCameraToStores() }
    }

    // Kullanıcının konumu bayilerden çok uzaksa (ör. simülatörün varsayılan konumu),
    // haritayı sabit bir noktaya değil, gösterilecek pin'lerin tamamını kapsayacak şekilde kadrajlar.
    private func fitCameraToStores() {
        guard !stores.isEmpty else { return }

        var coordinates = stores.map { CLLocationCoordinate2D(latitude: $0.latitude, longitude: $0.longitude) }
        if let userLocation {
            coordinates.append(userLocation)
        }

        let lats = coordinates.map(\.latitude)
        let lngs = coordinates.map(\.longitude)
        guard let minLat = lats.min(), let maxLat = lats.max(),
              let minLng = lngs.min(), let maxLng = lngs.max() else { return }

        let center = CLLocationCoordinate2D(latitude: (minLat + maxLat) / 2, longitude: (minLng + maxLng) / 2)
        let span = MKCoordinateSpan(
            latitudeDelta: max((maxLat - minLat) * 1.6, 0.05),
            longitudeDelta: max((maxLng - minLng) * 1.6, 0.05)
        )

        withAnimation {
            cameraPosition = .region(MKCoordinateRegion(center: center, span: span))
        }
    }

    private func pinColor(for level: StockLevel?) -> Color {
        switch level {
        case .IN_STOCK: return .green
        case .LOW: return .orange
        case .OUT_OF_STOCK: return .red
        case nil: return .accentColor
        }
    }
}
