//
//  TurkishCity.swift
//  pasaj
//
//  Backend henüz tek şehir (İstanbul) dışında bayi verisi sağlamıyor, ama arayüzü
//  şimdiden şehir bazlı aramaya hazırlıyoruz — backend çok şehirli veri sağladığında
//  buraya yeni satır eklemek yeterli olacak.
//

import CoreLocation

struct TurkishCity: Identifiable, Hashable {
    let name: String
    // Backend, şehir adını Türkçe karaktersiz (ASCII) döndürüyor (örn. "Istanbul", noktasız I) —
    // bu yüzden filtrelemede name yerine bu alan kullanılıyor. name sadece arayüzde gösteriliyor.
    let backendName: String
    let latitude: Double
    let longitude: Double

    var id: String { name }
    var coordinate: CLLocationCoordinate2D { CLLocationCoordinate2D(latitude: latitude, longitude: longitude) }
}

enum TurkishCities {
    static let all: [TurkishCity] = [
        TurkishCity(name: "İstanbul", backendName: "Istanbul", latitude: 41.0082, longitude: 28.9784),
        TurkishCity(name: "Ankara", backendName: "Ankara", latitude: 39.9334, longitude: 32.8597),
        TurkishCity(name: "İzmir", backendName: "Izmir", latitude: 38.4237, longitude: 27.1428),
        TurkishCity(name: "Bursa", backendName: "Bursa", latitude: 40.1826, longitude: 29.0665),
        TurkishCity(name: "Antalya", backendName: "Antalya", latitude: 36.8969, longitude: 30.7133),
    ]
}
