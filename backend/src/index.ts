import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import leadRoutes from './routes/leadRoutes';

dotenv.config();

const app = express();

/**
 * Middlewares
 */
app.use(express.json());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

/**
 * Health check (IMPORTANT)
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

/**
 * Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

/**
 * Root route
 */
app.get('/', (req, res) => {
  res.json({ message: 'GigFlow API running' });
});

/**
 * Start server
 */
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

start();
