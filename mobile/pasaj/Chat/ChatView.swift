//
//  ChatView.swift
//  pasaj
//
//  Müşterinin bayi/stok/işlem konularında kısa sorular sorup Gemini'den anlık
//  cevap alabildiği basit bir sohbet ekranı.
//

import SwiftUI

struct ChatView: View {
    @State private var viewModel = ChatViewModel()
    @FocusState private var inputFocused: Bool

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ScrollViewReader { proxy in
                    ScrollView {
                        VStack(alignment: .leading, spacing: 12) {
                            if viewModel.messages.isEmpty {
                                Text("Bayiler, stok durumu ya da yapılabilecek işlemler hakkında bana soru sorabilirsin.")
                                    .font(.subheadline)
                                    .foregroundStyle(.white.opacity(0.5))
                                    .padding(.top, 40)
                            }

                            ForEach(viewModel.messages) { message in
                                ChatBubble(message: message)
                                    .id(message.id)
                            }

                            if viewModel.isSending {
                                HStack(spacing: 8) {
                                    ProgressView()
                                    Text("Yazıyor…")
                                        .font(.caption)
                                        .foregroundStyle(.white.opacity(0.5))
                                }
                            }
                        }
                        .padding()
                    }
                    .onChange(of: viewModel.messages.count) { _, _ in
                        guard let lastId = viewModel.messages.last?.id else { return }
                        withAnimation { proxy.scrollTo(lastId, anchor: .bottom) }
                    }
                }

                if let errorMessage = viewModel.errorMessage {
                    Text(errorMessage)
                        .font(.caption)
                        .foregroundStyle(.red)
                        .padding(.horizontal)
                        .padding(.bottom, 4)
                }

                inputBar
            }
            .background(AppTheme.background)
            .navigationTitle("Sohbet")
            .sensoryFeedback(.impact(weight: .light), trigger: viewModel.sendTick)
        }
    }

    private var inputBar: some View {
        HStack(spacing: 8) {
            TextField("Bir soru sor…", text: $viewModel.inputText)
                .focused($inputFocused)
                .submitLabel(.send)
                .onSubmit { Task { await viewModel.send() } }
                .disabled(viewModel.isSending)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(AppTheme.surface)
                .clipShape(Capsule())

            Button {
                inputFocused = false
                Task { await viewModel.send() }
            } label: {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 32))
            }
            .tint(AppTheme.gold)
            .disabled(viewModel.inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || viewModel.isSending)
        }
        .padding()
    }
}

private struct ChatBubble: View {
    let message: ChatMessage
    @Environment(TabRouter.self) private var tabRouter

    private var isUser: Bool { message.role == .user }

    var body: some View {
        VStack(alignment: isUser ? .trailing : .leading, spacing: 6) {
            HStack {
                if isUser { Spacer(minLength: 40) }

                Text(message.text)
                    .font(.subheadline)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                    .background(isUser ? AppTheme.accent : AppTheme.surface)
                    .clipShape(RoundedRectangle(cornerRadius: 16))

                if !isUser { Spacer(minLength: 40) }
            }

            if let relatedTab = message.relatedTab {
                Button {
                    tabRouter.selectedTab = relatedTab
                } label: {
                    Label(
                        relatedTab == .islemler ? "İşlemler'e Git" : "Pasaj'a Git",
                        systemImage: relatedTab == .islemler ? "checklist" : "shippingbox"
                    )
                    .font(.caption.bold())
                }
                .buttonStyle(.glass)
                .tint(AppTheme.gold)
            }
        }
        .frame(maxWidth: .infinity, alignment: isUser ? .trailing : .leading)
    }
}

#Preview {
    ChatView()
        .environment(TabRouter())
}
