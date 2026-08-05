const bearerAuth = [{ bearerAuth: [] as string[] }];

const errorResponse = {
  type: 'object',
  properties: { message: { type: 'string' } },
} as const;

export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'LocalShop API',
    version: '1.0.0',
    description:
      'Yerel üreticilerin ürünlerini doğrudan müşterilere sattığı marketplace MVP API. ' +
      'Test kartları — başarılı: 4242424242424242, başarısız: 4000000000000000',
  },
  servers: [{ url: 'http://localhost:4000/api' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: errorResponse,
      Address: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string', example: 'Ev' },
          text: { type: 'string', example: 'Bahçelievler Mah. 12. Sok. No:3, Urla / İzmir' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['customer', 'seller'] },
          phone: { type: 'string' },
          addresses: { type: 'array', items: { $ref: '#/components/schemas/Address' } },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          stock: { type: 'integer' },
          category: {
            type: 'string',
            enum: ['gida', 'kozmetik', 'el-sanatlari', 'giyim', 'ev-yasam', 'diger'],
          },
          imageUrl: { type: 'string', example: '/uploads/abc.png' },
          sellerId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Cart: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                name: { type: 'string' },
                price: { type: 'number' },
                stock: { type: 'integer' },
                quantity: { type: 'integer' },
                lineTotal: { type: 'number' },
              },
            },
          },
          totalPrice: { type: 'number' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                sellerId: { type: 'string' },
                name: { type: 'string' },
                price: { type: 'number' },
                quantity: { type: 'integer' },
                lineTotal: { type: 'number' },
              },
            },
          },
          totalPrice: { type: 'number' },
          status: {
            type: 'string',
            enum: ['PENDING_PAYMENT', 'PAID', 'PAYMENT_FAILED', 'SHIPPED', 'DELIVERED'],
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Kayıt ol',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'role', 'phone'],
                properties: {
                  name: { type: 'string', minLength: 2 },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  role: { type: 'string', enum: ['customer', 'seller'] },
                  phone: { type: 'string', example: '0555 123 45 67' },
                  address: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Kayıt başarılı',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } },
            },
          },
          '409': { description: 'E-posta zaten kayıtlı' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Giriş yap',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Giriş başarılı',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } },
            },
          },
          '401': { description: 'E-posta veya şifre hatalı' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Mevcut kullanıcı',
        security: bearerAuth,
        responses: {
          '200': {
            description: 'Kullanıcı bilgisi',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          '401': { description: 'Token yok/geçersiz' },
        },
      },
    },
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'Ürünleri listele (public)',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'sellerId', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 } },
        ],
        responses: { '200': { description: 'Sayfalı ürün listesi' } },
      },
      post: {
        tags: ['Products'],
        summary: 'Ürün ekle (seller)',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'description', 'price', 'stock', 'category'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  stock: { type: 'integer' },
                  category: {
                    type: 'string',
                    enum: ['gida', 'kozmetik', 'el-sanatlari', 'giyim', 'ev-yasam', 'diger'],
                  },
                  imageUrl: { type: 'string', description: 'POST /api/uploads çıktısı' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Ürün oluşturuldu' },
          '403': { description: 'Seller rolü gerekli' },
        },
      },
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Ürün detayı (public)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Ürün' }, '404': { description: 'Bulunamadı' } },
      },
      put: {
        tags: ['Products'],
        summary: 'Ürün güncelle (seller + sahibi)',
        security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Güncellendi' },
          '403': { description: 'Sahibi değil' },
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Ürün sil (seller + sahibi)',
        security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '204': { description: 'Silindi' },
          '403': { description: 'Sahibi değil' },
        },
      },
    },
    '/products/seller/me': {
      get: {
        tags: ['Products'],
        summary: 'Kendi ürünlerim (seller)',
        security: bearerAuth,
        responses: { '200': { description: 'Ürün listesi' } },
      },
    },
    '/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Sepeti getir (customer)',
        security: bearerAuth,
        responses: {
          '200': {
            description: 'Sepet',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } },
          },
        },
      },
    },
    '/cart/items': {
      post: {
        tags: ['Cart'],
        summary: 'Sepete ürün ekle (customer)',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: {
                  productId: { type: 'string' },
                  quantity: { type: 'integer', minimum: 1 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Eklendi' },
          '400': { description: 'Yetersiz stok' },
        },
      },
    },
    '/cart/items/{productId}': {
      patch: {
        tags: ['Cart'],
        summary: 'Adet değiştir (customer)',
        security: bearerAuth,
        parameters: [
          { name: 'productId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['quantity'],
                properties: { quantity: { type: 'integer', minimum: 1 } },
              },
            },
          },
        },
        responses: { '200': { description: 'Güncellendi' } },
      },
      delete: {
        tags: ['Cart'],
        summary: 'Sepetten çıkar (customer)',
        security: bearerAuth,
        parameters: [
          { name: 'productId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Çıkarıldı' } },
      },
    },
    '/addresses': {
      get: {
        tags: ['Addresses'],
        summary: 'Adreslerimi listele',
        security: bearerAuth,
        responses: {
          '200': {
            description: 'Adres listesi',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Address' } },
              },
            },
          },
        },
      },
      post: {
        tags: ['Addresses'],
        summary: 'Yeni adres ekle',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'text'],
                properties: {
                  title: { type: 'string', minLength: 2, maxLength: 60, example: 'Ev' },
                  text: { type: 'string', minLength: 5, maxLength: 300 },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Eklenen adres',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Address' } } },
          },
          '400': { description: 'Geçersiz istek' },
        },
      },
    },
    '/addresses/{id}': {
      delete: {
        tags: ['Addresses'],
        summary: 'Adres sil',
        security: bearerAuth,
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Kalan adresler',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Address' } },
              },
            },
          },
          '404': { description: 'Adres bulunamadı' },
        },
      },
    },
    '/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Sepetten sipariş oluştur (customer) — PENDING_PAYMENT doğar',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['addressId'],
                properties: {
                  addressId: { type: 'string', description: 'Teslimat adresinin id değeri' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Sipariş',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } },
          },
          '400': { description: 'Sepet boş / stok yetersiz' },
          '404': { description: 'Adres bulunamadı' },
        },
      },
      get: {
        tags: ['Orders'],
        summary: 'Sipariş geçmişim (customer)',
        security: bearerAuth,
        responses: { '200': { description: 'Sipariş listesi' } },
      },
    },
    '/orders/{id}/status': {
      patch: {
        tags: ['Orders'],
        summary: 'Sipariş durumunu ilerlet (seller) — PAID→SHIPPED→DELIVERED',
        security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['SHIPPED', 'DELIVERED'] },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Güncellenen sipariş (satıcı görünümü)' },
          '400': { description: 'Geçersiz durum geçişi' },
          '403': { description: 'Siparişte satıcıya ait ürün yok' },
          '404': { description: 'Sipariş bulunamadı' },
        },
      },
    },
    '/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Sipariş detayı (customer + sahibi)',
        security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Sipariş' },
          '403': { description: 'Sahibi değil' },
        },
      },
    },
    '/orders/seller/me': {
      get: {
        tags: ['Orders'],
        summary: 'Gelen siparişler (seller) — yalnızca kendi kalemleri',
        security: bearerAuth,
        responses: { '200': { description: 'Sipariş listesi' } },
      },
    },
    '/uploads': {
      post: {
        tags: ['Uploads'],
        summary: 'Ürün görseli yükle (seller) — multipart/form-data, alan adı: image',
        description: 'JPEG/PNG/WebP, en fazla 2 MB. Dönen url ürün oluştururken kullanılır.',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: { image: { type: 'string', format: 'binary' } },
              },
            },
          },
        },
        responses: {
          '201': { description: '{ url: "/uploads/<dosya>" }' },
          '400': { description: 'Geçersiz dosya türü veya boyut' },
        },
      },
    },
    '/payments/pay': {
      post: {
        tags: ['Payments'],
        summary: 'FakePay ile sipariş öde (customer)',
        description:
          'Yalnızca PENDING_PAYMENT/PAYMENT_FAILED sipariş ödenebilir. ' +
          'Kart verisi hiçbir yerde saklanmaz.',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['orderId', 'cardNumber', 'cardHolder', 'expiry', 'cvv'],
                properties: {
                  orderId: { type: 'string' },
                  cardNumber: { type: 'string', example: '4242424242424242' },
                  cardHolder: { type: 'string' },
                  expiry: { type: 'string', example: '12/27' },
                  cvv: { type: 'string', example: '123' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Ödeme başarılı → order PAID, stok düşer' },
          '402': { description: 'Kart reddedildi → order PAYMENT_FAILED' },
          '409': { description: 'Sipariş zaten ödenmiş' },
        },
      },
    },
  },
} as const;
