//
//  StoreListRow.swift
//  pasaj
//

import SwiftUI

struct StoreListRow: View {
    let store: StoreWithDistance

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(alignment: .firstTextBaseline) {
                Text(store.name)
                    .font(.headline)
                    .foregroundStyle(.white)
                Spacer()
                if let stockLevel = store.stockLevel {
                    StockBadge(level: stockLevel)
                }
            }

            Text("\(store.district), \(store.city) • \(String(format: "%.1f", store.distance)) km uzakta")
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.6))

            StoreTypeBadge(type: store.type)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(AppTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

struct StoreTypeBadge: View {
    let type: StoreType

    var body: some View {
        Text(type == .TIM ? "TİM" : "Franchise")
            .font(.caption2.bold())
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(color.opacity(0.18))
            .foregroundStyle(color)
            .clipShape(Capsule())
    }

    private var color: Color {
        type == .TIM ? AppTheme.tim : AppTheme.franchise
    }
}

struct StockBadge: View {
    let level: StockLevel

    var body: some View {
        Text(label)
            .font(.caption2.bold())
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(color.opacity(0.18))
            .foregroundStyle(color)
            .clipShape(Capsule())
    }

    private var label: String {
        switch level {
        case .IN_STOCK: return "Stokta"
        case .LOW: return "Az Stok"
        case .OUT_OF_STOCK: return "Tükendi"
        }
    }

    private var color: Color {
        switch level {
        case .IN_STOCK: return .green
        case .LOW: return .orange
        case .OUT_OF_STOCK: return .red
        }
    }
}
