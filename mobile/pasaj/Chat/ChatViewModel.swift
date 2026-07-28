//
//  ChatViewModel.swift
//  pasaj
//

import AudioToolbox
import Foundation
import Observation

@Observable
final class ChatViewModel {
    var messages: [ChatMessage] = []
    var inputText: String = ""
    var isSending = false
    var errorMessage: String?
    var sendTick = 0

    private let client = GeminiAPIClient.shared

    // "işlem" gibi çok genel bir kelime kasıtlı olarak burada yok — bot'un cevabı hemen
    // hemen her zaman bu kelimeyi kullanıyor (sistem talimatında geçtiği için), bu yüzden
    // net bir Pasaj sorusunu (örn. "iphone almak istiyorum") bile İşlemler'e yönlendiriyordu.
    private let islemlerKeywords = [
        "yeni hat", "hat başvuru", "cihaz teslim", "tamir", "teknik servis",
        "numara taşıma", "fatura öde",
    ]
    private let pasajKeywords = [
        "stok", "ürün", "iphone", "telefon", "tablet", "aksesuar", "samsung", "xiaomi",
    ]

    func send() async {
        // Zaten bir istek devam ediyorsa (buton devre dışı olsa da klavyeden "gönder"e
        // basılırsa diye) ikinci kez göndermeyi engelliyoruz.
        guard !isSending else { return }

        let trimmed = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        AudioServicesPlaySystemSound(1104) // gönderme tık sesi
        sendTick += 1 //  ChatView'daki .sensoryFeedback

        messages.append(ChatMessage(role: .user, text: trimmed))
        inputText = ""
        isSending = true
        errorMessage = nil

        do {
            let reply = try await client.sendMessage(history: messages)
            let relatedTab = detectRelatedTab(question: trimmed, reply: reply)
            messages.append(ChatMessage(role: .assistant, text: reply, relatedTab: relatedTab))
        } catch {
            errorMessage = error.localizedDescription
        }

        isSending = false
    }

    // Önce kullanıcının kendi sorusuna bakıyoruz — niyeti en güvenilir şekilde o gösteriyor.
    // Soruda net bir sinyal yoksa (ör. çok belirsiz bir soru), bot'un cevabına bakıyoruz.
    private func detectRelatedTab(question: String, reply: String) -> AppTab? {
        matchTab(in: question.lowercased()) ?? matchTab(in: reply.lowercased())
    }

    private func matchTab(in text: String) -> AppTab? {
        if islemlerKeywords.contains(where: text.contains) { return .islemler }
        if pasajKeywords.contains(where: text.contains) { return .pasaj }
        return nil
    }
}
