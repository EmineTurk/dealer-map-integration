# Gün 8 — Tarayıcı Konum API (Geolocation) ve Geri Çekilme (Fallback) Tasarımı

## Bugün ne yaptım
Bugün Pasaj ve İşlemler sayfalarında kullanıcının anlık konumuna göre haritayı odaklamak için HTML5 Geolocation API (`navigator.geolocation`) entegrasyonu yaptım. Kullanıcı konum izni vermediğinde veya tarayıcı desteklemediğinde devreye giren, Ant Design Select bileşenleri ile donatılmış bir İl/İlçe seçim paneli (B planı / fallback) arayüzü tasarladım.

## Ne anladım
- `navigator.geolocation.getCurrentPosition` fonksiyonunun asenkron yapısını ve izin onay/red durumlarına göre hata yakalama (error callbacks) mekanizmalarını öğrendim.
- Kullanıcı izni reddettiğinde uygulamanın çökmemesi ve kullanıcıya alternatif bir deneyim sunulması için fallback (geri çekilme) tasarımının önemini anladım.
- Seçilen ilçe koordinatlarını harita merkezine ve arama referans konumuna eşleyerek konum tabanlı aramayı dinamikleştirdim.

## Ne anlamadım / kafama takılanlar
- Kullanıcı tarayıcıda konumu kalıcı olarak engellediğinde, kod tarafında tekrar izin istemek mümkün mü yoksa kullanıcının tarayıcı ayarlarından bunu elle mi değiştirmesi gerekiyor?

## Yarın standup'ta sormak istediğim
- Konum izninin verilmediği senaryolarda, kullanıcının en son seçtiği il/ilçe bilgisini `localStorage` üzerinde saklayıp sayfa tekrar açıldığında varsayılan olarak yüklemek kullanıcı deneyimi (UX) açısından doğru bir yaklaşım mıdır?
