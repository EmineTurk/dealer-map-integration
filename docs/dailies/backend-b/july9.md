# Gün 2 - REST, HTTP ve GET /stores in-memory
 
## Bugün ne yaptım
store-service içine in-memory bayi listesi ekledim. GET /stores ve GET /stores/{id} endpoint'lerini yazdım ve 15 İstanbul bayisiyle test ettim. Ardından Postman collection'ını hazırladım.
 
## Ne anladım
REST'te kaynak URL ile ifade ediliyor, HTTP metodu ise yapılacak işlemi belirtiyor. GET metodu okuma işlemi anlamına geliyor. Status kodları arasında 200 başarılı isteği, 404 ise kaynağın bulunamadığını gösteriyor.
 
In-memory listede Java record, List ve stream/filter kullanarak listeleme ve ID'ye göre arama yaptık. Controller, Service ve Repository katmanlarının ayrılması, endpoint'in sade ve okunabilir kalmasını sağlıyor.
 
## Ne anlamadım / kafama takılanlar
GET /stores?ids=1,5,9 şeklindeki filtrelemeyi bugün mü eklemeliyiz, yoksa stock-service'in bağlanacağı Gün 9'a kadar mı beklemeliyiz?
 
Spring'in varsayılan 404 cevabı ile contract'taki ApiError formatı birbirinden farklı görünüyor. Bu ikisini ne zaman hizalamalıyız?
 
## Yarın standup'ta sormak istediğim

 
