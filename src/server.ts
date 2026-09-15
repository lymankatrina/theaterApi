import express from 'express';

const app = express();

const port = process.env.Port || 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'San Juan Theater API'
  });
});
app.listen(port, () => {
  console.log(
    `Server running on port ${port}`
  );
});
