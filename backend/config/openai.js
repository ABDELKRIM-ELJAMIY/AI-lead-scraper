const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY, // تأكد أن الاسم مطابق تماماً لما هو مكتوب في الـ .env
  baseURL: 'https://api.groq.com/openai/v1', // هذا السطر هو ما يوجه الطلبات لـ Groq
});

module.exports = openai;