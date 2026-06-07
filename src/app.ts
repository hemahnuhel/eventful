import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import { swaggerSpec, swaggerUi } from './config/swagger';
import { initPassport } from './config/passport';
import routes from './routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Capture raw body on the Paystack webhook so HMAC signature verification works.
// Paystack signs the exact bytes it sends; re-serializing a parsed object would not match.
app.use(
  '/api/v1/payments/webhook',
  express.json({
    verify: (req: express.Request & { rawBody?: Buffer }, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.json());
app.use(morgan('dev'));

app.use('/api', rateLimiter);

initPassport(app);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
