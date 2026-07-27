//
//  ContentView.swift
//  pasaj
//

import SwiftUI

struct ContentView: View {
    @State private var locationManager = LocationManager()
    @State private var tabRouter = TabRouter()
    @AppStorage("hasSeenOnboarding") private var hasSeenOnboarding = false

    var body: some View {
        Group {
            if hasSeenOnboarding {
                mainTabView
            } else {
                OnboardingView(locationManager: locationManager) {
                    hasSeenOnboarding = true
                }
            }
        }
        .environment(locationManager)
        .environment(tabRouter)
    }

    private var mainTabView: some View {
        @Bindable var tabRouter = tabRouter
        return TabView(selection: $tabRouter.selectedTab) {
            PasajView()
                .tabItem { Label("Pasaj", systemImage: "shippingbox") }
                .tag(AppTab.pasaj)

            IslemlerView()
                .tabItem { Label("İşlemler", systemImage: "checklist") }
                .tag(AppTab.islemler)

            ChatView()
                .tabItem { Label("Sohbet", systemImage: "message") }
                .tag(AppTab.sohbet)
        }
        .tint(AppTheme.gold)
        .preferredColorScheme(.dark)
    }
}

#Preview {
    ContentView()
}
