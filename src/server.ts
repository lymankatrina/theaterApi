import express from 'express';

import { authMiddleware } from './middleware/auth.middleware';

import {
  connectToDatabase
} from './services/database.services';

import routes from './routes/index';

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(authMiddleware);
app.use('/', routes);

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'San Juan Theater API'
  });
});

connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(
        `Server running on port ${port}`
      );
    });
  })
  .catch((error: unknown) => {
    console.error(
      'Failed to connect to database:',
      error
    );
    process.exit(1);
  });
