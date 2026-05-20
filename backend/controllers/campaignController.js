const openai = require('../config/openai');
const mockLeads = require('../data/mockData');
const { sendCampaignEmail } = require('../services/emailService');

// 1. دالة التوليد الفردي (Single Test)
const generateCampaignText = async (req, res) => {
  try {
    const { productName, targetAudience, tone, recipientEmail } = req.body;

    if (!productName || !targetAudience) {
      return res.status(400).json({ error: 'الرجاء إدخال اسم المنتج والفئة المستهدفة.' });
    }

    const prompt = `صمم محتوى حملة تسويقية احترافية وجذابة للمنتج التالي: "${productName}".
الفئة المستهدفة: "${targetAudience}".
نبرة الصوت (Tone): "${tone || 'احترافية ومقنعة'}".
المطلوب: عنوان جذاب، يليه نص بريد إلكتروني تسويقي قصير ومباشر ينتهي بعبارة تحفيزية لاتخاذ إجراء (Call to Action).`;

    // تحديث الموديل هنا إلى llama-3.1-8b-instant
    const response = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant', 
      messages: [
        { role: 'system', content: 'أنت خبير تسويق رقمي ومحترف في كتابة النصوص الإعلانية (Copywriting).' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const generatedContent = response.choices[0].message.content;
    const htmlFormattedContent = generatedContent.replace(/\n/g, '<br>');

    let emailStatus = "لم يتم تحديد إيميل للإرسال";
    if (recipientEmail) {
      await sendCampaignEmail(
        recipientEmail, 
        `حملة تسويقية جديدة: ${productName}`, 
        htmlFormattedContent
      );
      emailStatus = `تم الإرسال بنجاح إلى ${recipientEmail}`;
    }

    res.status(200).json({
      success: true,
      emailStatus: emailStatus,
      data: generatedContent
    });

  } catch (error) {
    console.error('خطأ في السيرفر:', error.message);
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء معالجة الطلب.' });
  }
};

// 2. دالة الأتمتة الجماعية (Bulk Automation)
// دالة الأتمتة الجماعية المحدثة بالكامل لحقن البيانات الشخصية ومنع النصوص الزائدة
const triggerBulkAutomation = async (req, res) => {
  const { productName, tone, selectedLeads } = req.body; // استقبال القائمة المحددة هنا

  if (!productName || !tone) {
    return res.status(400).json({ success: false, error: 'الرجاء إدخال اسم المنتج ونبرة الصوت.' });
  }

  if (!selectedLeads || selectedLeads.length === 0) {
    return res.status(400).json({ success: false, error: 'الرجاء تحديد عميل واحد على الأقل للإرسال.' });
  }

  const resultsReport = [];

  try {
    // الدوران فقط على العملاء الذين تم تحديدهم وإرسالهم من الواجهة
    for (const lead of selectedLeads) {
      try {
        const personalizedPrompt = `
          Write a cold outreach email offering a product/service named "${productName}".
          
          RECIPIENT INFO:
          - Name: "${lead.name}"
          - Company: "${lead.company}"
          - Niche: "${lead.niche}"
          
          SENDER INFO (You MUST use these exact details for the signature and links):
          - My Name (Sender): "Abdelkrim El Jamiy"
          - My Title: "Full Stack & Automation Developer"
          - My Calendar Link: "https://calendly.com/eljamiiabdelkarim"
          
          EMAIL REQUIREMENTS:
          - Tone: "${tone}"
          - Do NOT leave any placeholders like [Your Name], [Your Company], [Your Calendly Link], or [Your Contact Information]. Fill them all using the Sender Info provided.
          - Make it sound organic, human-written, and professional.
        `;

        const response = await openai.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert cold email copywriter. You MUST ONLY output the actual email body itself (starting with the Subject line and ending with the signature). Never include any introductory phrases, conversational filler, post-generation summaries, notes, explanations, or commentary. Just the pure raw email text.' 
            },
            { role: 'user', content: personalizedPrompt }
          ],
          max_tokens: 400,
          temperature: 0.3,
        });

        const generatedText = response.choices[0].message.content;
        const htmlFormattedContent = generatedText.replace(/\n/g, '<br>');
        const emailSubject = `Tailored Solution for ${lead.company}`;

        await sendCampaignEmail(lead.email, emailSubject, htmlFormattedContent);

        resultsReport.push({
          leadId: lead.id,
          name: lead.name,
          company: lead.company,
          status: 'Success'
        });

      } catch (leadError) {
        resultsReport.push({
          leadId: lead.id,
          name: lead.name,
          company: lead.company,
          status: `Failed: ${leadError.message}`
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Bulk automation completed for selected leads.',
      report: resultsReport
    });

  } catch (globalError) {
    return res.status(500).json({
      success: false,
      error: `Global automation failure: ${globalError.message}`
    });
  }
};
const getLeads = async (req, res) => {
  try {
    res.status(200).json({ success: true, leads: mockLeads });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
module.exports = {
  generateCampaignText,
  triggerBulkAutomation,
  getLeads
};