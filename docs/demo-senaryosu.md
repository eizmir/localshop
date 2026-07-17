# Demo Video Senaryosu (5–10 dk)

Çekim öncesi: `./scripts/db.sh start`, backend ve frontend'i başlat.
Temiz bir demo için istersen `mongo localhost:27017/localshop --eval 'db.dropDatabase()'`
ile veritabanını sıfırla.

## Akış

1. **Giriş (30 sn)** — Proje tanıtımı: LocalShop, yerel üreticiler için marketplace.
   Mimari şeması: React + Express + MongoDB, controller/service ayrımı.

2. **Satıcı kaydı ve ürün ekleme (1.5 dk)**
   - `/register` → rol: Satıcı → otomatik satıcı paneline düşer
   - "+ Ürün Ekle" → örn. "Organik Bal", food, 250₺, stok 10
   - Panelde ürünün listelendiğini göster

3. **Müşteri akışı (2 dk)**
   - Çıkış → müşteri olarak kayıt
   - Ürün listesi: arama ("bal") ve kategori filtresi ("food") canlı göster
   - Ürün detayı → 2 adet sepete ekle → sepet rozeti güncellenir
   - Sepette adet değiştir, toplamın anlık değiştiğini göster

4. **Sipariş + Ödeme (2 dk)**
   - "Siparişi Oluştur" → ödeme sayfası, durum: "Ödeme Bekliyor"
   - Önce **4000 0000 0000 0000** → "Kart reddedildi", durum "Ödeme Başarısız"
     → ürün stokunun DEĞİŞMEDİĞİNİ göster
   - Sonra **4242 4242 4242 4242** → "Ödeme başarılı", durum "Ödendi"
     → stokun düştüğünü göster (10 → 8)

5. **Sipariş yönetimi (1 dk)**
   - Müşteri: Siparişlerim sayfası
   - Satıcı girişi: panelde "Gelen Siparişler" ve sipariş payı

6. **Güvenlik + dokümantasyon (1.5 dk)**
   - `/api-docs` Swagger UI'ı gez
   - Terminalde hızlı gösterim:
     - token'sız `GET /api/cart` → 401
     - customer token ile `POST /api/products` → 403
     - `db.payments.findOne()` → kart verisi yok
   - README'deki güvenlik tablosunu göster

## Vurgulanacak mimari noktalar

- Sipariş kalemleri fiyat **snapshot**'ı tutar — satıcı fiyat değiştirse de sipariş sabit
- Toplam tutar **sunucuda** hesaplanır
- Ownership: satıcı yalnızca **kendi** ürününü değiştirebilir
- Kart verisi **hiçbir zaman** veritabanına yazılmaz
- Çift ödeme engeli (409)
