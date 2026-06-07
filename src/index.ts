import 'dotenv/config';
import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectRedis } from './config/redis';
import { startWorkers } from './jobs/workers';

const bootstrap = async () => {
  await connectRedis();
  await startWorkers();

  app.listen(env.PORT, () => {
    logger.info(`Eventful API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
};

bootstrap().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
