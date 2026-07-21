# Gün 10 — Entegrasyon Günü (CORS Yönetimi, Mock'tan Gerçek API'ye Geçiş ve Demo #2)

## Bugün ne yaptım
Bugün projenin entegrasyon safhasında (Demo #2), frontend uygulamasını yerelde çalışan gerçek backend mikroservislerine (`stock-service` :8080, `store-service` :8081 ve `capability-service` :8082) uçtan uca bağladım. İki farklı köken (origin) arasındaki iletişimde ortaya çıkan CORS (Cross-Origin Resource Sharing) hatalarını inceledim. Axios tarafında yanıt durdurucuları (response interceptors) ve dinamik yüklenme durumları (`Spin` / `loading` göstergeleri) ekleyerek canlı entegrasyonu tamamladım.

## Ne anladım
- **CORS Nedir ve Neden Var?:** Tarayıcıların güvenlik protokolü gereği bir porttan (`localhost:5173`) başka bir porta (`localhost:8080`) yapılan asenkron HTTP isteklerinin varsayılan olarak engellendiğini, arka planda bir `OPTIONS` (preflight) isteği atıldığını ve backend tarafında `@CrossOrigin` izni verildiğinde isteğin geçtiğini öğrendim.
- **End-to-End Entegrasyon:** UI üzerindeki arama butonunun Axios isteğini tetiklemesi, asenkron verinin beklenmesi esnasında kullanıcıya yüklenme durumunun (loading spinner) gösterilmesi ve veri geldiğinde haritadaki pinlerin anlık güncellenmesi akışını pekiştirdim.
- **Güvenli Fallback Tasarımı:** Backend mikroservisi kapalı olsa dahi uygulamanın çökmemesi ve otomatik mock veriye geçerek tarayıcı konsoluna bilgilendirici hata logları basması mantığını kavradım.

## Ne anlamadım / kafama takılanlar
- Hafta 3'te tüm servisleri Spring Cloud Gateway arkasına topladığımızda, CORS iznini her mikroserviste ayrı ayrı tanımlamak yerine sadece Gateway üzerinde tanımlamak yeterli olacak mı?

## Yarın standup'ta sormak istediğim
- Gateway kurulduğunda frontend tarafındaki Axios base URL adreslerini tek bir ortam değişkeni (`VITE_GATEWAY_URL`) altında birleştirmek mimari açıdan en doğru yaklaşım mıdır?
