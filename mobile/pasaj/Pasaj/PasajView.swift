//
//  PasajView.swift
//  pasaj
//
//  "Yakınımda Stokta": ürün ara -> haritada + listede o ürünün stoklu olduğu en yakın bayiler.
//

import SwiftUI

struct PasajView: View {
    @State private var viewModel = PasajViewModel()
    @Environment(LocationManager.self) private var locationManager
    @State private var selectedStoreId: Int?
    @State private var selectedStoreForDetail: StoreWithDistance?
    @FocusState private var searchFieldFocused: Bool

    private var showSuggestions: Bool {
        searchFieldFocused && viewModel.suggestions.count > 1
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    filterSection
                    resultsSection
                }
                .padding()
            }
            .background(AppTheme.background)
            .navigationTitle("Pasaj")
            .task {
                await viewModel.loadProducts()
                await viewModel.loadOverview(userLocation: locationManager.userLocation)
            }
            .onChange(of: selectedStoreId) { _, newValue in
                selectedStoreForDetail = viewModel.nearbyStores.first { $0.id == newValue }
            }
            .sheet(item: $selectedStoreForDetail) { store in
                StoreDetailView(store: store)
            }
        }
    }

    private var filterSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Filtrele")
                .font(.headline)
                .foregroundStyle(.white)

            VStack(alignment: .leading, spacing: 6) {
                Text("Kategori")
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.7))
                Picker("", selection: $viewModel.categoryFilter) {
                    Text("Tümü").tag(String?.none)
                    ForEach(viewModel.categories, id: \.self) { category in
                        Text(category).tag(String?.some(category))
                    }
                }
                .pickerStyle(.menu)
                .tint(.white)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(AppTheme.background)
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("Ürün")
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.7))
                TextField("Ürün ara (örn. iPhone 15)", text: $viewModel.searchText)
                    .focused($searchFieldFocused)
                    .submitLabel(.search)
                    .onSubmit { Task { await viewModel.search(userLocation: locationManager.userLocation) } }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(AppTheme.background)
                    .clipShape(RoundedRectangle(cornerRadius: 8))

                if showSuggestions {
                    VStack(spacing: 0) {
                        ForEach(viewModel.suggestions) { product in
                            Button {
                                searchFieldFocused = false
                                Task { await viewModel.selectSuggestion(product, userLocation: locationManager.userLocation) }
                            } label: {
                                VStack(alignment: .leading, spacing: 1) {
                                    Text(product.name).font(.subheadline).foregroundStyle(.white)
                                    Text(product.category).font(.caption2).foregroundStyle(.white.opacity(0.5))
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                            }
                            .buttonStyle(.plain)

                            if product.id != viewModel.suggestions.last?.id {
                                Divider().overlay(Color.white.opacity(0.1))
                            }
                        }
                    }
                    .background(AppTheme.background)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }
            }

            Button {
                searchFieldFocused = false
                Task { await viewModel.search(userLocation: locationManager.userLocation) }
            } label: {
                Text("Ara")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 6)
            }
            .buttonStyle(.glassProminent)
            .tint(AppTheme.accent)
            .disabled(viewModel.searchText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
        }
        .padding(16)
        .glassEffect(in: RoundedRectangle(cornerRadius: 14))
    }

    // Harita her zaman görünür — arama yapılmadan önce boş, sonuç bulununca dolar.
    @ViewBuilder
    private var resultsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            if let selectedProduct = viewModel.selectedProduct {
                HStack(spacing: 6) {
                    Image(systemName: "shippingbox.fill")
                        .foregroundStyle(AppTheme.gold)
                    Text("Gösterilen ürün: \(selectedProduct.name)")
                        .font(.subheadline.bold())
                        .foregroundStyle(.white)
                }
            }

            StoreMapView(
                stores: viewModel.nearbyStores,
                userLocation: locationManager.userLocation,
                selectedStoreId: $selectedStoreId
            )
            .frame(height: 240)
            .clipShape(RoundedRectangle(cornerRadius: 14))

            if !viewModel.hasSearched {
                Text("Stok durumunu görmek için bir ürün ara")
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.6))
            } else if viewModel.isLoadingStores {
                ProgressView()
                    .frame(maxWidth: .infinity)
                    .padding(.top, 8)
            } else if let errorMessage = viewModel.errorMessage {
                ContentUnavailableView(
                    "Bir sorun oluştu",
                    systemImage: "wifi.slash",
                    description: Text(errorMessage)
                )
            } else if viewModel.nearbyStores.isEmpty {
                ContentUnavailableView("Bayi bulunamadı", systemImage: "shippingbox")
            } else if viewModel.selectedProduct != nil {
                // Genel bakışta (ürün seçilmeden önce) liste gösterilmez, harita yeterli —
                // liste yalnızca somut bir ürün araması sonucunda (stok detayıyla) anlamlı.
                Text("Bulunan Mağazalar (\(viewModel.nearbyStores.count))")
                    .font(.headline)
                    .foregroundStyle(.white)

                VStack(spacing: 10) {
                    ForEach(viewModel.nearbyStores) { store in
                        Button {
                            selectedStoreForDetail = store
                        } label: {
                            StoreListRow(store: store)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }
}

#Preview {
    PasajView()
        .environment(LocationManager())
}
