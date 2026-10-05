import express from 'express';

import { authMiddleware } from './middleware/auth.middleware';

import { connectToDatabase } from './services/database.services';
import { seedSeats } from './services/seeds/seats.seed';
import { processExpiredCarts } from './services/carts.services';

import routes from './routes/index';

const app = express();

const port = process.env.PORT || 3000;

const CART_EXPIRATION_CHECK_INTERVAL = 60 * 1000;

app.use(express.json());
app.use(authMiddleware);
app.use('/', routes);

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'San Juan Theater API'
  });
});

connectToDatabase()
  .then(async () => {
    await seedSeats();
    setInterval(() => {
      processExpiredCarts().catch((error) => {
        console.error('Error processing expired carts:', error);
      });
    }, CART_EXPIRATION_CHECK_INTERVAL);

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error: unknown) => {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  });
