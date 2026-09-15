import express from 'express';

import {
  connectToDatabase
} from './services/database.services';

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

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
