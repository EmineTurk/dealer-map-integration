# Gün 9 — Axios Entegrasyonu ve Gerçek Veriye Geçiş (Mock'lardan Arınma)

## Bugün ne yaptım
Bugün frontend tarafındaki mock veri import'larından kurtulmak için Axios istemcisi (`axios.create`) konfigürasyonunu yaptım. `frontend/src/api/client.ts` altında servisleri (stock-service:8080, store-service:8081, capability-service:8082) ayrı ayrı yapılandırdım. Gerçek backend servislerinin kapalı olması veya CORS hatası vermesi durumunda uygulamanın çökmesini engellemek amacıyla otomatik mock geri-çekilme (mock fallback) mantığını entegre ettim.

## Ne anladım
- API katmanını UI katmanından soyutlamanın projenin sürdürülebilirliği ve test edilebilirliği açısından neden hayati olduğunu anladım.
- Axios instance yapısı ile servis bazlı base URL ve timeout ayarlarının nasıl yönetildiğini öğrendim.
- `useEffect` hook'ları içerisinde asenkron veri çekme isteklerini yönetirken state güncellemelerini ve loading (yükleniyor) animasyonlarını koordine etmeyi pekiştirdim.

## Ne anlamadım / kafama takılanlar
- Gerçek ortamda mikroservis portları yerine tüm istekleri tek bir API Gateway üzerinden geçirmek CORS sorunlarını tamamen ortadan kaldırır mı?

## Yarın standup'ta sormak istediğim
- Gateway kurulumuna geçtiğimizde frontend `.env` dosyasındaki tüm servis adreslerini tek bir Gateway base URL'ine yönlendirecek şekilde güncelleyecek miyiz?
