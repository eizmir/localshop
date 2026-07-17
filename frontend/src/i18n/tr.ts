import type { Category } from '../constants/categories';
import type { OrderStatus } from '../types';

export const tr = {
  appName: '🛍 LocalShop',

  nav: {
    products: 'Ürünler',
    cart: 'Sepet',
    myOrders: 'Siparişlerim',
    sellerPanel: 'Satıcı Paneli',
    login: 'Giriş',
    register: 'Kayıt Ol',
    logout: (name: string) => `Çıkış (${name})`,
  },

  errors: {
    generic: 'Bir şeyler ters gitti, tekrar deneyin',
    tooManyRequests: 'Çok fazla istek — lütfen biraz bekleyin',
    pageNotFound: 'Sayfa bulunamadı',
  },

  categories: {
    gida: 'Gıda',
    kozmetik: 'Kozmetik',
    'el-sanatlari': 'El Sanatları',
    giyim: 'Giyim',
    'ev-yasam': 'Ev & Yaşam',
    diger: 'Diğer',
  } satisfies Record<Category, string>,

  statuses: {
    PENDING_PAYMENT: 'Ödeme Bekliyor',
    PAID: 'Ödendi',
    PAYMENT_FAILED: 'Ödeme Başarısız',
    SHIPPED: 'Kargoda',
    DELIVERED: 'Teslim Edildi',
  } satisfies Record<OrderStatus, string>,

  login: {
    title: 'Giriş Yap',
    email: 'E-posta',
    password: 'Şifre',
    submit: 'Giriş Yap',
    submitting: 'Giriş yapılıyor…',
    noAccount: 'Hesabınız yok mu?',
    registerLink: 'Kayıt olun',
  },

  register: {
    title: 'Kayıt Ol',
    name: 'Ad Soyad',
    email: 'E-posta',
    password: 'Şifre (en az 8 karakter)',
    phone: 'Telefon',
    address: 'Adres',
    accountType: 'Hesap türü',
    customerOption: 'Müşteri — alışveriş yapacağım',
    sellerOption: 'Satıcı — ürün satacağım',
    submit: 'Kayıt Ol',
    submitting: 'Kaydediliyor…',
    haveAccount: 'Zaten hesabınız var mı?',
    loginLink: 'Giriş yapın',
  },

  productList: {
    title: 'Ürünler',
    searchPlaceholder: 'Ara… (ör. bal)',
    allCategories: 'Tüm kategoriler',
    empty: 'Aramanıza uygun ürün bulunamadı.',
    prev: '← Önceki',
    next: 'Sonraki →',
    pageOf: (page: number, pages: number) => `Sayfa ${page} / ${pages}`,
    sellersTitle: 'Satıcılar',
    sellerProducts: (name: string) => `${name} ürünleri`,
    clearSeller: '× Filtreyi kaldır',
    productCount: (n: number) => `${n} ürün`,
  },

  product: {
    stock: (n: number) => `Stok: ${n}`,
    outOfStock: 'Tükendi',
    quantity: 'Adet',
    addToCart: 'Sepete Ekle',
    adding: 'Ekleniyor…',
    added: 'Sepete eklendi.',
    goToCart: 'Sepete git →',
    notFound: 'Ürün bulunamadı',
  },

  cart: {
    title: 'Sepetim',
    empty: 'Sepetiniz boş.',
    browse: 'Ürünlere göz atın →',
    colProduct: 'Ürün',
    colPrice: 'Fiyat',
    colQuantity: 'Adet',
    colTotal: 'Tutar',
    remove: 'Kaldır',
    total: (amount: string) => `Toplam: ${amount} ₺`,
    checkout: 'Siparişi Oluştur',
    processing: 'İşleniyor…',
    quantityOf: (name: string) => `${name} adedi`,
  },

  orders: {
    title: 'Siparişlerim',
    empty: 'Henüz siparişiniz yok.',
    total: (amount: string) => `Toplam: ${amount} ₺`,
  },

  payment: {
    title: 'Ödeme',
    orderTotal: 'Sipariş tutarı:',
    cardNumber: 'Kart Numarası',
    cardHolder: 'Kart Üzerindeki İsim',
    expiry: 'Son Kullanma (AA/YY)',
    cvv: 'CVV',
    pay: (amount: string) => `${amount} ₺ Öde`,
    paying: 'Ödeme işleniyor…',
    testCards:
      'Test kartları — başarılı: 4242 4242 4242 4242 · başarısız: 4000 0000 0000 0000',
    orderNotFound: 'Sipariş bulunamadı',
    goToOrders: 'Siparişlerime git →',
  },

  seller: {
    title: 'Satıcı Paneli',
    addProduct: '+ Ürün Ekle',
    myProducts: 'Ürünlerim',
    noProducts: 'Henüz ürününüz yok.',
    incomingOrders: 'Gelen Siparişler',
    noOrders: 'Henüz siparişiniz yok.',
    sellerShare: (amount: string) => `Sipariş payınız: ${amount} ₺`,
    colProduct: 'Ürün',
    colCategory: 'Kategori',
    colPrice: 'Fiyat',
    colStock: 'Stok',
    delete: 'Sil',
    confirmDelete: (name: string) => `"${name}" silinsin mi?`,
    stockOf: (name: string) => `${name} stok`,
  },

  addProduct: {
    title: 'Yeni Ürün',
    name: 'Ürün Adı',
    description: 'Açıklama',
    price: 'Fiyat (₺)',
    stock: 'Stok',
    category: 'Kategori',
    selectCategory: 'Kategori seçin',
    image: 'Ürün Fotoğrafı (isteğe bağlı, en fazla 2 MB)',
    submit: 'Ürünü Ekle',
    submitting: 'Kaydediliyor…',
  },
} as const;
