// backend/src/config/database.js (CREATE THIS FILE)
const DATABASE_CONFIG = {
  // Replace with your database
  mongodb: {
    url: process.env.MONGODB_URL || "mongodb://localhost:27017/your-analytics",
  },
  mysql: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "your-user",
    password: process.env.DB_PASSWORD || "your-password",
    database: process.env.DB_NAME || "your-analytics",
  },
  postgresql: {
    connectionString:
      process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/your-analytics",
  },
};
