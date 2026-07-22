//
//  IslemlerView.swift
//  pasaj
//
//  "Yakınımda İşlem": filtrele -> Bayi Ara -> haritada + listede sonuçlar.
//

import SwiftUI

struct IslemlerView: View {
    @State private var viewModel = IslemlerViewModel()
    @Environment(LocationManager.self) private var locationManager
    @State private var selectedStoreId: Int?
    @State private var selectedStoreForDetail: StoreWithDistance?

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
            .navigationTitle("İşlemler")
            .task {
                await viewModel.loadOptions()
                await viewModel.search(userLocation: locationManager.userLocation)
            }
            .onChange(of: selectedStoreId) { _, newValue in
                selectedStoreForDetail = viewModel.filteredStores.first { $0.id == newValue }
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

            labeledPicker(title: "Hangi işlemi gerçekleştirmek istiyorsunuz?") {
                Picker("", selection: Binding(
                    get: { viewModel.selectedCapability },
                    set: { viewModel.selectedCapability = $0 }
                )) {
                    ForEach(viewModel.capabilityOptions) { option in
                        Text(option.label).tag(Optional(option))
                    }
                }
            }

            labeledPicker(title: "Çalışma Günleri & Saatleri") {
                Picker("", selection: $viewModel.workingHoursFilter) {
                    ForEach(WorkingHoursFilter.allCases) { option in
                        Text(option.rawValue).tag(option)
                    }
                }
            }

            labeledPicker(title: "Bayi Tipi") {
                Picker("", selection: $viewModel.storeTypeFilter) {
                    Text("Tümü").tag(StoreType?.none)
                    Text("TİM").tag(StoreType?.some(.TIM))
                    Text("Franchise").tag(StoreType?.some(.FRANCHISE))
                }
            }

            Button {
                Task { await viewModel.search(userLocation: locationManager.userLocation) }
            } label: {
                Text("Bayi Ara")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 6)
            }
            .buttonStyle(.glassProminent)
            .tint(AppTheme.accent)
            .disabled(viewModel.selectedCapability == nil)
        }
        .padding(16)
        .glassEffect(in: RoundedRectangle(cornerRadius: 14))
    }

    @ViewBuilder
    private func labeledPicker<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.7))
            content()
                .pickerStyle(.menu)
                .tint(.white)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(AppTheme.background)
                .clipShape(RoundedRectangle(cornerRadius: 8))
        }
    }

    // Harita her zaman görünür — arama sonucu gelmeden önce boş, geldikten sonra pin'lerle dolu.
    @ViewBuilder
    private var resultsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            StoreMapView(
                stores: viewModel.filteredStores,
                userLocation: locationManager.userLocation,
                selectedStoreId: $selectedStoreId
            )
            .frame(height: 240)
            .clipShape(RoundedRectangle(cornerRadius: 14))

            if viewModel.isLoadingStores {
                ProgressView()
                    .frame(maxWidth: .infinity)
                    .padding(.top, 8)
            } else if let errorMessage = viewModel.errorMessage {
                ContentUnavailableView(
                    "Bir sorun oluştu",
                    systemImage: "wifi.slash",
                    description: Text(errorMessage)
                )
            } else if viewModel.hasSearched {
                Text("Uygun Bayiler (\(viewModel.filteredStores.count))")
                    .font(.headline)
                    .foregroundStyle(.white)

                if viewModel.filteredStores.isEmpty {
                    ContentUnavailableView("Yakında bu işlemi yapan bayi yok", systemImage: "mappin.slash")
                } else {
                    VStack(spacing: 10) {
                        ForEach(viewModel.filteredStores) { store in
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
}

#Preview {
    IslemlerView()
        .environment(LocationManager())
}
