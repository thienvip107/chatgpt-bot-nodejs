const TelegramBot = require("node-telegram-bot-api");
const DbService = require ("./db.service");
const ChatGPTService = require("./chatgpt.service");

class TelegramService {
  bot;
  constructor() {
  }
  register(polling = false) {
    const telegramToken = process.env.TELEGRAM_KEY;
    this.bot = new TelegramBot(telegramToken, {polling});
    return this.bot;
  }
  async responseToMessage(msg) {
    const bot = this.bot;
    const authorId = msg.from.id      // Lấy id của người gửi
    const chatId = msg.chat.id;       // ID của cuộc trò chuyện hiện tại
    const chatMsg = msg.text;         // Nội dung của tin nhắn đã nhận
    // Đầu tiên sẽ lấy thông tin user ra
    const user = await DbService.getUserByTelegramId(authorId);
    if (msg.text === '/clear') {
      // Xoá các tin nhắn cũ trong lịch sử
      await DbService.clearUserMessages(user._id);
      return bot.sendMessage(chatId, 'Messages has been cleared');
    }
    if (msg.text.includes('/topic')) {
      // Xoá các tin nhắn cũ trong lịch sử
      user.topic = chatMsg.slice(6);
      await user.save()
      return bot.sendMessage(chatId, user.topic);
    }
    if (msg.text === '/role') {
      // Xoá các tin nhắn cũ trong lịch sử
      user.role = chatMsg
      await user.save()
      return bot.sendMessage(chatId, user.role);
    }
    const timer = new Date().getTime();
    // Trả lời tin nhắn dựa trên các tin nhắn cũ
    const responseMsg = await ChatGPTService.generateCompletion(chatMsg, user);
    const timeDiff = new Date().getTime() - timer;
    console.log('Taken ' + timeDiff + 'ms to respond (about ' + ~~(timeDiff / 100) / 10 + 's)');
    return await bot.sendMessage(chatId, responseMsg);
  }
}

const telegramService = new TelegramService();

module.exports = telegramService;
