//
//  TabRouter.swift
//  pasaj
//
//  Sekmeler arası programatik geçiş için paylaşılan durum. Sohbet ekranı,
//  cevabın ilgili olduğu sekmeye kullanıcıyı yönlendirebilsin diye var.
//

import Observation

enum AppTab: Hashable {
    case pasaj
    case islemler
    case sohbet
}

@Observable
final class TabRouter {
    var selectedTab: AppTab = .pasaj
}
