require('dotenv').config();
const { sendCampaignEmail } = require('../services/emailService');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

const generateCampaignText = async (req, res) => {
  try {
    const { productName, targetAudience, tone, recipientEmail } = req.body;

    if (!productName || !targetAudience) {
      return res.status(400).json({ error: 'الرجاء إدخال اسم المنتج والفئة المستهدفة.' });
    }

    if (!OPENAI_API_KEY) {
      console.error('Error: OPENAI_API_KEY is not set in environment variables.');
      return res.status(500).json({ success: false, error: 'Server configuration error.' });
    }

    const prompt = `Create a marketing email for the following product:
Product: "${productName}"
Target audience: "${targetAudience}"
Tone: "${tone || 'professional and persuasive'}"

Requirements:
- Write a strong subject line.
- Write a short email body (3-5 sentences).
- Include a clear call to action.
- Mention one main benefit and one urgency driver.
- Use plain English with standard spaces only.
- Return only the subject line followed by the email body, with no extra explanation.`;

    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'groq/compound-mini',
        messages: [
          { role: 'system', content: 'You are a digital marketing expert and professional copywriter. Write concise and compelling email marketing copy in plain English with standard spaces only.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.62,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API error:', data);
      return res.status(response.status).json({
        success: false,
        error: data.error?.message || 'Groq API request failed.',
      });
    }

    const generatedContent = data.choices?.[0]?.message?.content || '';
    const cleanedContent = generatedContent
      .replace(/\u202F/g, ' ')
      .replace(/\u00A0/g, ' ')
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const htmlFormattedContent = cleanedContent.replace(/\n/g, '<br>');

    let emailStatus = 'No recipient email provided.';
    if (recipientEmail) {
      await sendCampaignEmail(
        recipientEmail,
        `New Marketing Campaign: ${productName}`,
        htmlFormattedContent
      );
      emailStatus = `Email sent successfully to ${recipientEmail}`;
    }

    res.status(200).json({
      success: true,
      emailStatus,
      data: cleanedContent,
    });
  } catch (error) {
    console.error('Error in server:', error.message || error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء معالجة الطلب.',
    });
  }
};

module.exports = { generateCampaignText };