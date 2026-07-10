# Gün 2 — REST, HTTP ve GET /stores (in-memory)

## Bugün ne yaptım
store-service içine in-memory bayi listesi ekledim. GET /stores ve GET /stores/{id} endpoint'lerini yazdım; 15 İstanbul bayisiyle test ettim. Postman collection'ı hazırladım.

## Ne anladım
REST'te kaynak URL ile ifade edilir (/stores), HTTP metodu işlemi söyler (GET = oku). Status kodları: 200 başarılı, 404 kaynak yok. In-memory listede Java record + List + stream/filter ile listeleme ve ID'ye göre arama yaptık. Controller → Service → Repository ayrımı, endpoint'i ince tutuyor.

## Ne anlamadım / kafama takılanlar
- GET /stores?ids=1,5,9 filtrelemesini Day 2'de mi, yoksa stock-service bağlanacağı Gün 9'da mı eklemeliyiz?
- Spring'in varsayılan 404 cevabı ile contract'taki ApiError formatı farklı — ne zaman hizalarız?

## Yarın standup'ta sormak istediğim
Gün 3'te Oracle Docker (gvenzl/oracle-free) kurulumunda Windows'ta bilinen bir tuzak var mı? STORE tablosu için şema adını nasıl seçelim?
