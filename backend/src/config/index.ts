import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongodbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string;
}

const config: Config = {
  port: parseInt(process.env.PORT ?? "5000", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",

  // ✅ IMPORTANT: no localhost fallback
  mongodbUri: process.env.MONGODB_URI as string,

  jwtSecret:
    process.env.JWT_SECRET ??
    "fallback_dev_secret_change_in_production",

  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",

  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
};

export default config;
