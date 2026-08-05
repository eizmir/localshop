import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { addressesRouter } from './routes/addresses';
import { authRouter } from './routes/auth';
import { cartRouter } from './routes/cart';
import { ordersRouter } from './routes/orders';
import { paymentsRouter } from './routes/payments';
import { uploadsRouter, UPLOADS_DIR } from './routes/uploads';
import swaggerUi from 'swagger-ui-express';
import { openapiSpec } from './docs/openapi';
import { productsRouter } from './routes/products';
import { sellersRouter } from './routes/sellers';
import './types/auth';

export function createApp(): express.Express {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
    }),
  );
  app.use(express.json());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/addresses', addressesRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/sellers', sellersRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/uploads', uploadsRouter);
  app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '1d' }));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
