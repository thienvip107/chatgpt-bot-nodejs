const {Configuration, OpenAIApi} = require("openai");
const DbService = require('./db.service');

class ChatGPTService {
  rolePlayIntroduction = 'As an expert chatbot called Siri, your main task is to confide in the user like a person knowledgeable about life, society, political events, current affairs as well as readiness. respond to all user requests, ready to listen and uphold the user role and feelings when chatting. You must also keep in mind the information that the user has given in the conversation. During the conversation, examples and examples should be provided to support your arguments and suggestions. Remember to always keep the conversation fun and relaxed. talk with short answer';
  async generateCompletion(prompt, user) {
    // Lấy đống tin nhắn cũ ra
    const oldMessages = await DbService.getUserMessages(user._id);

    // Load key từ file environment
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_KEY,
    });
    const openai = new OpenAIApi(configuration);

    let fullPrompt = this.rolePlayIntroduction + '\n\n';

    if (oldMessages && oldMessages.length > 0) {
      fullPrompt += 'CHAT:\n';
      // nếu có tin nhắn cũ thì thêm đoạn tin nhắn cũ đấy vào nội dung chat
      for (let message of oldMessages) {
        fullPrompt += `User: ${message.userMessage}\n`;
        fullPrompt += `Siri: ${message.botMessage}\n\n`;
      }
    }

    fullPrompt += `User: ${prompt}\n`;
    fullPrompt += `Siri: `;

    console.log(fullPrompt);

    // Gửi request về OpenAI Platform để tạo text completion
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: fullPrompt,
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    // Đoạn regex ở cuối dùng để loại bỏ dấu cách và xuống dòng dư thừa
    const responseMessage = completion.data.choices[0].text.replace(/^\s+|\s+$/g, "");

    // Lưu lại tin nhắn vào Database
    await DbService.createNewMessage(user, prompt, responseMessage);
    return responseMessage;
  }
}

module.exports = new ChatGPTService();
