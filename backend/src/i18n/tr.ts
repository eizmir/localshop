export const tr = {
  notFound: 'Kayıt bulunamadı',
  serverError: 'Sunucu hatası',
  invalidRequest: 'Geçersiz istek',
  invalidQuery: 'Geçersiz sorgu parametreleri',

  authRequired: 'Giriş yapmalısınız',
  invalidToken: 'Geçersiz veya süresi dolmuş token',
  forbidden: 'Bu işlem için yetkiniz yok',
  emailTaken: 'Bu e-posta ile kayıtlı bir hesap var',
  invalidCredentials: 'E-posta veya şifre hatalı',
  userNotFound: 'Kullanıcı bulunamadı',

  productNotFound: 'Ürün bulunamadı',
  productForbidden: 'Bu ürün üzerinde işlem yetkiniz yok',

  cartItemNotFound: 'Ürün sepette yok',
  insufficientStockAdd: (max: number) => `Yetersiz stok: en fazla ${max} adet eklenebilir`,
  insufficientStockSet: (max: number) => `Yetersiz stok: en fazla ${max} adet seçilebilir`,

  addressNotFound: 'Adres bulunamadı',
  addressRequired: 'Sipariş için bir teslimat adresi seçmelisiniz',
  defaultAddressTitle: 'Adresim',

  cartEmpty: 'Sepetiniz boş',
  productGone: 'Sepetteki bir ürün artık satışta değil',
  insufficientStockOrder: (name: string, left: number) =>
    `"${name}" için yeterli stok yok (kalan: ${left})`,
  orderNotFound: 'Sipariş bulunamadı',
  orderForbidden: 'Bu sipariş size ait değil',
  orderNotForSeller: 'Bu siparişte size ait ürün yok',
  invalidStatusTransition: 'Sipariş bu durumdayken bu değişiklik yapılamaz',

  alreadyPaid: 'Bu sipariş zaten ödenmiş',
  outOfStock: (name: string) => `"${name}" için stok kalmadı, ödeme yapılamaz`,
  cardDeclined: 'Kart reddedildi',
  paymentSuccess: 'Ödeme başarılı',
  invalidCardNumber: 'Geçersiz kart numarası',
  cardExpired: 'Kartın süresi dolmuş',

  invalidFileType: 'Yalnızca JPEG, PNG veya WebP yüklenebilir',
  fileRequired: 'Dosya gerekli',
} as const;
