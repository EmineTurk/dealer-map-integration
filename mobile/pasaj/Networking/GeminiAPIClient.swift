//
//  GeminiAPIClient.swift
//  pasaj
//
//  Google Gemini REST API'sine (generateContent) istek atan basit bir client.
//  Anahtar Secrets.swift'te tutuluyor — bkz. Secrets.swift.example.
//

import Foundation

enum GeminiError: Error, LocalizedError {
    case missingAPIKey
    case invalidResponse(status: Int, body: String)
    case emptyReply

    var errorDescription: String? {
        switch self {
        case .missingAPIKey: return "Gemini API anahtarı ayarlanmamış"
        case .invalidResponse(let status, let body): return "Sunucudan geçersiz yanıt geldi (HTTP \(status)): \(body)"
        case .emptyReply: return "Boş yanıt alındı"
        }
    }
}

final class GeminiAPIClient {
    static let shared = GeminiAPIClient()

    private let model = "gemini-3.5-flash-lite"
    private let decoder = JSONDecoder()

    private let systemPrompt = """
    Sen Turkcell Bayi Bulucu uygulamasının müşteri destek asistanısın. Türkçe, kısa ve net \
    cevaplar ver. Sadece bayi bulma, ürün stok durumu ve bayilerde yapılabilecek işlemler \
    (yeni hat başvurusu, cihaz teslimatı, cihaz tamiri, numara taşıma, fatura ödeme) hakkında \
    yardımcı ol. Bilmediğin bir şey sorulursa, bunun uygulamanın kapsamı dışında olduğunu söyle.
    """

    private init() {}

    func sendMessage(history: [ChatMessage]) async throws -> String {
        guard Secrets.geminiAPIKey != "PASTE_YOUR_GEMINI_API_KEY_HERE", !Secrets.geminiAPIKey.isEmpty else {
            throw GeminiError.missingAPIKey
        }

        guard let url = URL(string: "https://generativelanguage.googleapis.com/v1beta/models/\(model):generateContent?key=\(Secrets.geminiAPIKey)") else {
            throw GeminiError.invalidResponse(status: -1, body: "Geçersiz URL")
        }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = GeminiRequestBody(
            contents: history.map {
                GeminiRequestBody.Content(role: $0.role == .user ? "user" : "model", parts: [.init(text: $0.text)])
            },
            systemInstruction: .init(role: nil, parts: [.init(text: systemPrompt)])
        )
        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw GeminiError.invalidResponse(status: -1, body: "HTTP yanıtı okunamadı")
        }
        guard (200...299).contains(httpResponse.statusCode) else {
            let bodyText = String(data: data, encoding: .utf8) ?? "(boş gövde)"
            throw GeminiError.invalidResponse(status: httpResponse.statusCode, body: bodyText)
        }

        let decoded = try decoder.decode(GeminiResponseBody.self, from: data)
        guard let text = decoded.candidates?.first?.content.parts.first?.text else {
            throw GeminiError.emptyReply
        }
        return text
    }
}

private struct GeminiRequestBody: Encodable {
    struct Part: Encodable { let text: String }

    struct Content: Encodable {
        let role: String?
        let parts: [Part]

        // role nil ise JSON'a hiç yazmıyoruz — Gemini systemInstruction'da "role" alanının
        // tamamen yok olmasını bekliyor, "role": null olarak gelmesini değil.
        enum CodingKeys: String, CodingKey { case role, parts }

        func encode(to encoder: Encoder) throws {
            var container = encoder.container(keyedBy: CodingKeys.self)
            if let role { try container.encode(role, forKey: .role) }
            try container.encode(parts, forKey: .parts)
        }
    }

    let contents: [Content]
    let systemInstruction: Content
}

private struct GeminiResponseBody: Decodable {
    struct Candidate: Decodable {
        struct Content: Decodable {
            struct Part: Decodable { let text: String }
            let parts: [Part]
        }
        let content: Content
    }
    let candidates: [Candidate]?
}
