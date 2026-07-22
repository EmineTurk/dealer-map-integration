//
//  ContentView.swift
//  pasaj
//

import SwiftUI

struct ContentView: View {
    @State private var locationManager = LocationManager()

    var body: some View {
        TabView {
            PasajView()
                .tabItem { Label("Pasaj", systemImage: "shippingbox") }

            IslemlerView()
                .tabItem { Label("İşlemler", systemImage: "checklist") }
        }
        .tint(AppTheme.gold)
        .preferredColorScheme(.dark)
        .environment(locationManager)
        .task {
            locationManager.requestPermission()
        }
    }
}

#Preview {
    ContentView()
}
