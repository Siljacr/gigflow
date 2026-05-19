import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import leadRoutes from './routes/leadRoutes';

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// root
app.get('/', (_req, res) => {
  res.json({ message: 'GigFlow API running' });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
    });
  } catch (err) {
    console.error('DB connection error:', err);
    process.exit(1);
  }
};

start();
