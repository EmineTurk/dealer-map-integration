//
//  OnboardingView.swift
//
//
//  İlk açılışta bir kez gösterilen tanıtım akışı. Son sayfada konum izni
//  isteniyor

import SwiftUI

private struct OnboardingPage {
    let icon: String
    let title: String
    let description: String
}

private let onboardingPages: [OnboardingPage] = [
    OnboardingPage(
        icon: "storefront.fill",
        title: "Turkcell Bayi Bulucu'ya Hoş Geldin",
        description: "En yakın bayileri saniyeler içinde bul, işini yerinden kalkmadan hallet."
    ),
    OnboardingPage(
        icon: "shippingbox.fill",
        title: "Yakınımda Stokta",
        description: "Aradığın ürünü seç, hangi bayide stokta olduğunu haritada ve listede gör."
    ),
    OnboardingPage(
        icon: "checklist",
        title: "Yakınımda İşlem",
        description: "Yeni hat, cihaz teslimatı veya tamir gibi işlemleri yapabilecek en yakın bayiyi bul."
    ),
]

struct OnboardingView: View {
    let locationManager: LocationManager
    let onFinish: () -> Void

    @State private var currentPage = 0

    private var isLastPage: Bool { currentPage == onboardingPages.count - 1 }

    var body: some View {
        ZStack {
            AppTheme.background.ignoresSafeArea()

            VStack(spacing: 24) {
                TabView(selection: $currentPage) {
                    ForEach(Array(onboardingPages.enumerated()), id: \.offset) { index, page in
                        OnboardingPageView(page: page)
                            .tag(index)
                            .contentShape(Rectangle())
                            .onTapGesture { advance() }
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))

                pageIndicator

                if isLastPage {
                    Text("Konumunu, sana en yakın bayileri gösterebilmemiz için kullanacağız.")
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.5))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                        .transition(.opacity)
                }

                Button {
                    advance()
                } label: {
                    Text(isLastPage ? "Başla" : "Devam Et")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 6)
                }
                .buttonStyle(.glassProminent)
                .tint(AppTheme.gold)
                .padding(.horizontal, 24)

                if !isLastPage {
                    Button("Atla") { finish() }
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.5))
                } else {
                    // Son sayfada da yükseklik sabit kalsın diye görünmez bir tutucu.
                    Color.clear.frame(height: 20)
                }
            }
            .padding(.vertical, 40)
        }
    }

    private var pageIndicator: some View {
        HStack(spacing: 8) {
            ForEach(onboardingPages.indices, id: \.self) { index in
                Capsule()
                    .fill(index == currentPage ? AppTheme.gold : Color.white.opacity(0.2))
                    .frame(width: index == currentPage ? 20 : 8, height: 8)
                    .animation(.easeInOut, value: currentPage)
            }
        }
    }

    private func advance() {
        if isLastPage {
            finish()
        } else {
            withAnimation { currentPage += 1 }
        }
    }

    private func finish() {
        locationManager.requestPermission()
        onFinish()
    }
}

private struct OnboardingPageView: View {
    let page: OnboardingPage

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: page.icon)
                .font(.system(size: 72))
                .foregroundStyle(AppTheme.gold)

            Text(page.title)
                .font(.title2.bold())
                .foregroundStyle(.white)
                .multilineTextAlignment(.center)

            Text(page.description)
                .font(.body)
                .foregroundStyle(.white.opacity(0.7))
                .multilineTextAlignment(.center)

            Spacer()
            Spacer()
        }
        .padding(.horizontal, 32)
    }
}

#Preview {
    OnboardingView(locationManager: LocationManager(), onFinish: {})
}
