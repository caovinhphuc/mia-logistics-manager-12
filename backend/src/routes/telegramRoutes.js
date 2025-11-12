const express = require("express");
const router = express.Router();

// Dùng fetch tích hợp của Node >=18 (không cần import node-fetch)

function getTelegramConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  return { token, chatId };
}

async function sendTelegramMessage({ token, chatId, text }) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  const data = await res.json();
  if (!data.ok) {
    const err = new Error(data.description || "Telegram API error");
    err.status = 502;
    err.details = data;
    throw err;
  }
  return data;
}

// GET /api/telegram/test -> gửi tin nhắn test
router.get("/test", async (req, res) => {
  try {
    const { token, chatId } = getTelegramConfig();
    if (!token || !chatId) {
      return res.status(400).json({
        success: false,
        error: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID",
      });
    }
    const text = `✅ Kiểm tra kết nối Telegram thành công: ${new Date().toISOString()}`;
    const result = await sendTelegramMessage({ token, chatId, text });
    return res.json({ success: true, result });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      error: err.message || "Failed to send test message",
      details: err.details,
    });
  }
});

// POST /api/telegram/send { text }
router.post("/send", async (req, res) => {
  try {
    const { token, chatId } = getTelegramConfig();
    const { text } = req.body || {};
    if (!token || !chatId) {
      return res.status(400).json({
        success: false,
        error: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID",
      });
    }
    if (!text) {
      return res.status(400).json({ success: false, error: "Missing text" });
    }
    const result = await sendTelegramMessage({ token, chatId, text });
    return res.json({ success: true, result });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      error: err.message || "Failed to send message",
      details: err.details,
    });
  }
});

// GET /api/telegram/env -> kiểm tra biến môi trường có được nạp hay chưa (ẩn giá trị)
router.get("/env", (req, res) => {
  const token = process.env.TELEGRAM_BOT_TOKEN || "";
  const chatId = process.env.TELEGRAM_CHAT_ID || "";
  res.json({
    success: true,
    hasToken: Boolean(token),
    hasChatId: Boolean(chatId),
    tokenPreview: token ? `${token.slice(0, 8)}…(${token.length})` : null,
    chatIdPreview: chatId ? `${String(chatId).slice(0, 4)}…(${String(chatId).length})` : null,
    loadedFrom: "server.cjs loads root .env then backend/.env",
  });
});

module.exports = router;
