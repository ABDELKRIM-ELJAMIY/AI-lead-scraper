const openai = require('../config/openai');
const mockLeads = require('../data/mockData');
const { sendCampaignEmail } = require('../services/emailService');

// 1. توليد نص لحملة فردية (النظام القديم المستقر)
const generateCampaignText = async (req, res) => {
  try {
    const { productName, targetAudience, tone, recipientEmail } = req.body;

    if (!productName || !targetAudience) {
      return res.status(400).json({ error: 'Please provide product name and target audience.' });
    }

    const prompt = `صمم محتوى حملة تسويقية احترافية وجذابة للمنتج التالي: "${productName}".
الفئة المستهدفة: "${targetAudience}".
نبرة الصوت (Tone): "${tone || 'احترافية ومقنعة'}".
المطلوب: عنوان جذاب، يليه نص بريد إلكتروني تسويقي قصير ومباشر ينتهي بعبارة تحفيزية لاتخاذ إجراء (Call to Action).`;

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

    let emailStatus = "No email provided for sending";
    if (recipientEmail) {
      await sendCampaignEmail(
        recipientEmail, 
        `Campaign: ${productName}`, 
        htmlFormattedContent
      );
      emailStatus = `Sent successfully to ${recipientEmail}`;
    }

    res.status(200).json({
      success: true,
      emailStatus: emailStatus,
      data: generatedContent
    });

  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ success: false, error: 'An error occurred while processing the request.' });
  }
};

// 2. دالة الـ Bulk Automation المطورة والمدعومة بالبث الحي الحقيقي (SSE + AI + Real Email)
const triggerBulkAutomationSSE = async (req, res) => {
  const { productName, tone, selectedLeads } = req.body;

  // إعدادات الـ Headers الصارمة للبث الفوري المتوافق مع CORS ومنع الـ Buffering
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  // دالة إرسال السجلات للـ Frontend وضخها فوراً
  const sendLog = (message, status = 'info', leadId = null) => {
    const data = JSON.stringify({ timestamp: new Date().toLocaleTimeString(), message, status, leadId });
    res.write(`data: ${data}\n\n`);
    if (res.flush) res.flush();
    else if (res.flushHeaders) res.flushHeaders();
  };

  // التحقق الفوري من البيانات قبل بدء المعالجة
  if (!productName || !tone) {
    sendLog('❌ Configuration error: Missing product name or tone selection.', 'error');
    res.end();
    return;
  }

  if (!selectedLeads || selectedLeads.length === 0) {
    sendLog('❌ Targeting error: No leads were selected for this run.', 'error');
    res.end();
    return;
  }

  sendLog('⚡ Engine Initiated: Starting Advanced Contextual Campaign Pipeline...', 'info');
  const report = [];

  try {
    for (const lead of selectedLeads) {
      try {
        // تحديث واجهة المستخدم فوراً لحالة المعالجة الحالية للعميل
        sendLog(`🔄 Fetching context & generating cold email copy for: ${lead.name} (${lead.company})`, 'processing', lead.id);

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

        // استدعاء الـ AI الفعلي لكل عميل سياقياً
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

        // إرسال البريد الإلكتروني الفعلي للعميل
        sendLog(`✉️ Copy generated. Dispatching real email node to ${lead.email}...`, 'processing', lead.id);
        await sendCampaignEmail(lead.email, emailSubject, htmlFormattedContent);

        // إرسال حالة النجاح الفورية للعميل في الواجهة والتيرمنال
        sendLog(`✅ Successfully contextualized & dispatched to ${lead.company}!`, 'success', lead.id);
        report.push({ leadId: lead.id, status: 'Success' });

      } catch (leadError) {
        sendLog(`❌ Error handling pipeline step for ${lead.company}: ${leadError.message}`, 'error', lead.id);
        report.push({ leadId: lead.id, status: 'Failed' });
      }
    }

    // بث تقرير الإغلاق النهائي لإعلام الـ Frontend بانتهاء العملية بالكامل وثبات التقارير
    const finalData = JSON.stringify({ done: true, report });
    res.write(`data: ${finalData}\n\n`);
    res.end();

  } catch (globalError) {
    sendLog(`🚨 Critical Global Pipeline Failure: ${globalError.message}`, 'error');
    res.end();
  }
};

// 3. جلب قائمة العملاء
const getLeads = async (req, res) => {
  try {
    res.status(200).json({ success: true, leads: mockLeads });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// الابقاء على الدالة القديمة لضمان عدم كسر أي مسارات برمجية مرتبطة
const triggerBulkAutomation = async (req, res) => {
  // تم تحويل الثقل إلى دالة الـ SSE البثية المباشرة
  return triggerBulkAutomationSSE(req, res);
};

module.exports = {
  generateCampaignText,
  triggerBulkAutomation,
  triggerBulkAutomationSSE,
  getLeads
};