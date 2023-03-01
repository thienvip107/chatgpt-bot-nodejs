// Config các biến môi trường
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const ChatGPTService = require('./services/chatgpt.service');
const DbService = require('./services/db.service');
const TelegramService = require("./services/telegram.service");

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

DbService.connect().then(() => {
  // Khởi tạo con Bot từ Token với chế độ Polling
  const bot = TelegramService.register(true);
  // Phản hồi tin nhắn
  bot.on('message', async (msg) => TelegramService.responseToMessage(msg));
});

app.post('/api/message', async (req, res) => {
  const user = await DbService.getUserByTelegramId(req.body.userId);

  const responseMsg = await ChatGPTService.generateCompletion(req.body.message, user);
  return res.send(responseMsg)
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
