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
 * Health Check Route (VERY IMPORTANT)
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GigFlow Backend is running',
  });
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

/**
 * Root Route (optional but useful)
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GigFlow API Running',
  });
});

/**
 * Start Server AFTER DB connection
 */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 GigFlow API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

startServer();
