import { createApp } from './app';
import { connectDb } from './config/db';
import { env } from './config/env';

async function main(): Promise<void> {
  await connectDb();
  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`API hazır → http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('Başlatma hatası:', err);
  process.exit(1);
});
