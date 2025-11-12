const path = require("path");
const dotenv = require("dotenv");
const fs = require("fs");

// Ưu tiên nạp .env ở project root, sau đó fallback nạp backend/.env (nếu có)
const rootEnv = path.resolve(process.cwd(), ".env");
const backendEnv = path.resolve(__dirname, ".env");

// Log debug về .env files
// eslint-disable-next-line no-console
console.log("🔍 Loading environment files:");
// eslint-disable-next-line no-console
console.log(`   Root .env: ${rootEnv} (exists: ${fs.existsSync(rootEnv)})`);
// eslint-disable-next-line no-console
console.log(`   Backend .env: ${backendEnv} (exists: ${fs.existsSync(backendEnv)})`);

const result1 = dotenv.config({ path: rootEnv });
const result2 = dotenv.config({ path: backendEnv });

if (result1.parsed) {
  // eslint-disable-next-line no-console
  console.log(`   ✅ Loaded ${Object.keys(result1.parsed).length} vars from root .env`);
}
if (result2.parsed) {
  // eslint-disable-next-line no-console
  console.log(`   ✅ Loaded ${Object.keys(result2.parsed).length} vars from backend .env`);
}

// Log Telegram vars (ẩn giá trị thật)
const telegramToken = process.env.TELEGRAM_BOT_TOKEN || "";
const telegramChatId = process.env.TELEGRAM_CHAT_ID || "";
// eslint-disable-next-line no-console
console.log(
  `🔐 Telegram env: TOKEN=${telegramToken ? `${telegramToken.slice(0, 8)}...` : "MISSING"}, CHAT_ID=${telegramChatId || "MISSING"}`
);

const http = require("http");
const { app } = require("./src/app");

const PORT = process.env.BACKEND_PORT || process.env.PORT || 5050;

const server = http.createServer(app);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Backend listening on port ${PORT} (${process.env.NODE_ENV || "development"})`);
});

// Graceful shutdown
const shutdown = (signal) => {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received: closing server...`);
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log("HTTP server closed");
    process.exit(0);
  });
  // Force close server after 10secs
  setTimeout(() => {
    // eslint-disable-next-line no-console
    console.error("Forcing shutdown after timeout");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  // eslint-disable-next-line no-console
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  // eslint-disable-next-line no-console
  console.error("Uncaught Exception:", err);
});
