const {Configuration, OpenAIApi} = require("openai");
const DbService = require('./db.service');

class ChatGPTService {
  rolePlayIntroduction = 'As an expert chatbot called Siri, your main task is to confide in the user like a person knowledgeable about life, society, political events, current affairs as well as readiness. respond to all user requests, ready to listen and uphold the user role and feelings when chatting. You must also keep in mind the information that the user has given in the conversation.I want you to act as a spoken English teacher and improver. I will speak to you in English and you will reply to me in English to practice my spoken English. I want you to keep your reply neat, limiting the reply to 100 words. I want you to strictly correct my grammar mistakes, typos, and factual errors. I want you to ask me a question in your reply. Now lets start practicing, you could ask me a question first. Remember, I want you to strictly correct my grammar mistakes, typos, and factual errors.. During the conversation, examples and examples should be provided to support your arguments and suggestions. Remember to always keep the conversation fun and relaxed. talk with short and simple answer';
  async generateCompletion(prompt, user) {
    // Lấy đống tin nhắn cũ ra
    const oldMessages = await DbService.getUserMessages(user._id);

    // Load key từ file environment
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_KEY,
    });
    const openai = new OpenAIApi(configuration);

    let fullPrompt = this.rolePlayIntroduction + '\n\n';
    const arrMess = [{role: "system", "content": user.topic + ", answer short and simple" || this.rolePlayIntroduction}]
    if (oldMessages && oldMessages.length > 0) {
      fullPrompt += 'CHAT:\n';
      // nếu có tin nhắn cũ thì thêm đoạn tin nhắn cũ đấy vào nội dung chat
      for (let message of oldMessages) {
        fullPrompt += `User: ${message.userMessage}\n`;
        fullPrompt += `Siri: ${message.botMessage}\n\n`;
        arrMess.push({role: "user", content: message.userMessage})
        arrMess.push({role: "assistant", content: message.botMessage})
      }
    }
    arrMess.push({role: "user", content: prompt})
    // Gửi request về OpenAI Platform để tạo text completion
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: arrMess,
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    // Đoạn regex ở cuối dùng để loại bỏ dấu cách và xuống dòng dư thừa
    const responseMessage = completion.data.choices[0].message.content

    // Lưu lại tin nhắn vào Database
    await DbService.createNewMessage(user, prompt, responseMessage);
    return responseMessage;
  }
}

module.exports = new ChatGPTService();
