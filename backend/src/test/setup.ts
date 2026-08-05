// Testler gerçek .env'e bağlı olmasın: config/env zod ile doğrulama yapıp
// eksik değerde process.exit(1) çağırıyor, bu da test koşucusunu öldürürdü.
// dotenv mevcut process.env değerlerini ezmediği için burada verdiklerimiz kazanır.
process.env.MONGODB_URI ??= 'mongodb://127.0.0.1:27017/localshop-test';
process.env.JWT_SECRET ??= 'test-icin-yeterince-uzun-gizli-anahtar';
process.env.JWT_EXPIRES_IN ??= '1d';
process.env.CORS_ORIGIN ??= 'http://localhost:5173';
