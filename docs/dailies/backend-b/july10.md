# Gün 3 - Docker image vs container, temel SQL

## Bugün ne yaptım
gvenzl/oracle-free imajını Docker Compose ile ayağa kaldırdım. store_app şemasında STORE tablosunu SQL ile tasarlayıp oluşturdum (id, name, address, city, district, latitude, longitude, type + opsiyonel phone/working_hours). Init script'in CDB$ROOT/SYS'te tablo açma tuzağını görüp PDB (FREEPDB1) + şema öneki ile düzelttim. DBeaver bağlantı bilgilerini store-service/sql altına koydum.

## Ne anladım
**Image**, çalıştırılabilir bir şablondur; **container**, o şablondan ayağa kalkan canlı süreçtir. Aynı image'dan birden fazla container açılabilir; veriyi kalıcı tutmak için volume gerekir. Oracle'da volume silinmeden container silinirse tablolar kaybolmaz.

SQL tarafında CREATE TABLE ile kolon tiplerini (VARCHAR2, NUMBER) ve kuralları (PRIMARY KEY, CHECK type IN (TIM,FRANCHISE)) veritabanına yazıyoruz. Index'ler (city, district) ileride bölgesel filtrelemeyi hızlandırır. Gün 3'te Spring henüz DB'ye bağlanmıyor; endpoint hâlâ in-memory bağlantı Gün 4'te JPA ile gelecek.

## Ne anlamadım / kafama takılanlar
- Backend A (PRODUCT/STOCK) ile Backend B (STORE) aynı Oracle instance'ında farklı kullanıcı mı kullanmalı, yoksa ayrı container mı?
- Init script (/container-entrypoint-initdb.d) sadece ilk volume oluşturmada mı çalışıyor; tabloyu sonradan değiştirirsem nasıl migrate ederim?

## Yarın standup'ta sormak istediğim
Gün 4'te JPA entity yazarken id için Oracle SEQUENCE / IDENTITY mi kullanacağız, yoksa seed'de elle mi vereceğiz?
