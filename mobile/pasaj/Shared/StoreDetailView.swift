//
//  StoreDetailView.swift
//  pasaj
//
//  Bir bayiye (liste kartı ya da harita pin'i) dokununca açılan detay sayfası.
//

import SwiftUI
import MapKit

struct StoreDetailView: View {
    let store: StoreWithDistance
    // stok bildirimi aboneliği için hangi ürünün stoğa geleceğini bilmemiz gerekiyor.
    var product: Product? = nil
    
    @Environment(\.dismiss) private var dismiss

    @State private var showNotifyForm = false
    @State private var notifyEmail = ""
    @State private var notifyPhone = ""
    @State private var isSubscribing = false
    @State private var subscribeConfirmed = false
    @State private var subscribeError: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    Text(store.name)
                        .font(.title2.bold())
                        .foregroundStyle(.white)

                    HStack(spacing: 8) {
                        StoreTypeBadge(type: store.type)
                        if let stockLevel = store.stockLevel {
                            StockBadge(level: stockLevel)
                        }
                    }

                    Map(initialPosition: .region(
                        MKCoordinateRegion(
                            center: CLLocationCoordinate2D(latitude: store.latitude, longitude: store.longitude),
                            span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01)
                        )
                    )) {
                        Marker(store.name, systemImage: "storefront.fill", coordinate: CLLocationCoordinate2D(latitude: store.latitude, longitude: store.longitude))
                            .tint(AppTheme.gold)
                    }
                    .frame(height: 180)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                    .allowsHitTesting(false)

                    VStack(alignment: .leading, spacing: 14) {
                        detailRow(icon: "mappin.and.ellipse", title: "Adres", value: "\(store.address), \(store.district)/\(store.city)")
                        detailRow(icon: "clock", title: "Çalışma Saatleri", value: store.workingHours)
                        detailRow(icon: "phone", title: "Telefon", value: store.phone)
                        detailRow(icon: "location", title: "Mesafe", value: String(format: "%.1f km uzakta", store.distance))
                    }
                    .padding(16)
                    .glassEffect(in: RoundedRectangle(cornerRadius: 14))

                    Button {
                        openInMaps()
                    } label: {
                        Label("Yol Tarifi Al", systemImage: "arrow.triangle.turn.up.right.diamond.fill")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 6)
                    }
                    .buttonStyle(.glassProminent)
                    .tint(AppTheme.accent)

                    if let phoneURL = URL(string: "tel:\(store.phone.filter(\.isNumber))") {
                        Link(destination: phoneURL) {
                            Label("Bayiyi Ara", systemImage: "phone.fill")
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 6)
                        }
                        .buttonStyle(.glass)
                    }

                    if store.stockLevel == .OUT_OF_STOCK, product != nil {
                        Button {
                            showNotifyForm = true
                        } label: {
                            Label("Stoğa Gelince Haber Ver", systemImage: "bell.badge.fill")
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 6)
                        }
                        .buttonStyle(.glass)
                        .tint(AppTheme.gold)
                    }
                }
                .padding()
            }
            .background(AppTheme.background)
            .navigationTitle("Bayi Detayı")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Kapat") { dismiss() }
                }
            }
            .sheet(isPresented: $showNotifyForm) {
                notifyFormSheet
            }
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
    }

    private func detailRow(icon: String, title: String, value: String) -> some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: icon)
                .foregroundStyle(AppTheme.gold)
                .frame(width: 20)
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.caption).foregroundStyle(.white.opacity(0.5))
                Text(value).font(.body).foregroundStyle(.white)
            }
        }
    }

    private func openInMaps() {
        let coordinate = CLLocationCoordinate2D(latitude: store.latitude, longitude: store.longitude)
        let placemark = MKPlacemark(coordinate: coordinate)
        let mapItem = MKMapItem(placemark: placemark)
        mapItem.name = store.name
        mapItem.openInMaps(launchOptions: [MKLaunchOptionsDirectionsModeKey: MKLaunchOptionsDirectionsModeDriving])
    }

    private var notifyFormSheet: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 16) {
                if subscribeConfirmed {
                    ContentUnavailableView(
                        "Kaydedildi",
                        systemImage: "checkmark.circle.fill",
                        description: Text("Bu ürün stoğa gelince sana haber vereceğiz.")
                    )
                } else {
                    Text("Bu ürün stoğa gelince haber verelim mi? E-posta ya da telefon numaranı bırak (en az biri yeterli).")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.7))

                    TextField("E-posta", text: $notifyEmail)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 10)
                        .background(AppTheme.background)
                        .clipShape(RoundedRectangle(cornerRadius: 8))

                    TextField("Telefon", text: $notifyPhone)
                        .keyboardType(.phonePad)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 10)
                        .background(AppTheme.background)
                        .clipShape(RoundedRectangle(cornerRadius: 8))

                    if let subscribeError {
                        Text(subscribeError)
                            .font(.caption)
                            .foregroundStyle(.red)
                    }

                    Button {
                        Task { await subscribeToNotification() }
                    } label: {
                        if isSubscribing {
                            ProgressView()
                                .frame(maxWidth: .infinity)
                        } else {
                            Text("Kaydet")
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 6)
                        }
                    }
                    .buttonStyle(.glassProminent)
                    .tint(AppTheme.gold)
                    .disabled(isSubscribing || (notifyEmail.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && notifyPhone.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty))

                    Spacer()
                }
            }
            .padding()
            .background(AppTheme.background)
            .navigationTitle("Stok Bildirimi")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Kapat") { showNotifyForm = false }
                }
            }
        }
        .presentationDetents([.medium])
        .presentationDragIndicator(.visible)
    }

    private func subscribeToNotification() async {
        guard let product else { return }
        isSubscribing = true
        subscribeError = nil

        let trimmedEmail = notifyEmail.trimmingCharacters(in: .whitespacesAndNewlines)
        let trimmedPhone = notifyPhone.trimmingCharacters(in: .whitespacesAndNewlines)

        do {
            try await AppEnvironment.apiClient.subscribeToStockNotification(
                productId: product.id,
                storeId: store.id,
                email: trimmedEmail.isEmpty ? nil : trimmedEmail,
                phone: trimmedPhone.isEmpty ? nil : trimmedPhone
            )
            withAnimation { subscribeConfirmed = true }
        } catch {
            subscribeError = error.localizedDescription
        }

        isSubscribing = false
    }
}
