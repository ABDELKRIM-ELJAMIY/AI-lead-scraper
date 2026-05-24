// 1. استيراد الحزم المطلوبة وخدمة الخرائط
const { fetchRealLeadsFromMaps } = require('../services/mapsService');
const { sendCampaignEmail } = require('../services/emailService');
const { getWebsiteContext } = require('../services/websiteService');
const fs = require('fs');
const path = require('path');
const CampaignLog = require('../models/CampaignLog');

// 2. إعداد اتصال Groq مباشرة باستخدام الـ Key الموجود في الـ .env
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// دالة مساعدة: تنظيف النص الخام القادم من الـ AI
//  1. تزيل أي علامات تنصيص (مزدوجة، مفردة، زاوية) في البداية والنهاية
//  2. تزيل أي نص تم وضعه بين علامات تنصيص على شكل فقرة واحدة
//  3. تزيل الأسطر الفارغة المتتالية والمسافات الزائدة
//  4. تقليم النص النهائي
const cleanAIMessage = (rawText) => {
  if (!rawText) return '';
  return rawText
    // إزالة علامات التنصيص في البداية والنهاية
    .replace(/^[\s]*["'«]+|["'»]+[\s]*$/g, '')
    // إزالة تبادلات الأسطر المتتالية (إبقاء سطر واحد فقط)
    .replace(/\n+/g, ' ')
    // تقليل المسافات المتعددة إلى مسافة واحدة
    .replace(/\s{2,}/g, ' ')
    // تقليم المسافات على الجانبين
    .trim();
};

const historyFilePath = path.join(__dirname, '../data/history.json');

// تأمين وجود مجلد وملف السجل عند بدء التشغيل
if (!fs.existsSync(path.dirname(historyFilePath))) {
  fs.mkdirSync(path.dirname(historyFilePath), { recursive: true });
}
if (!fs.existsSync(historyFilePath)) {
  fs.writeFileSync(historyFilePath, JSON.stringify([]));
}

// توليد نص لحملة فردية (حسب الهيكل القديم)
const generateCampaignText = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: "Use bulk automation for campaigns." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// جلب قائمة العملاء الحية من SerpApi (Google Maps) + استخراج سياق الموقع + توليد رسالة واتساب مخصصة
const getLeads = async (req, res) => {
  try {
    const { niche, location } = req.query;
    if (!niche || !location) {
      return res.status(200).json({ success: true, leads: [] });
    }

    // 1) جلب العملاء من خرائط جوجل
    const liveLeads = await fetchRealLeadsFromMaps(niche, location);

    if (liveLeads.length === 0) {
      return res.status(200).json({ success: true, leads: [] });
    }

    // 2) استخراج سياق الموقع لكل عميل بشكل متوازٍ (بدون انتظار كل واحد على حدة)
    //    لا نزور الموقع إذا كان رابط social media فقط
    const leadsWithContext = await Promise.all(
      liveLeads.map(async (lead) => {
        const isSocialOrInvalid = !lead.site ||
          lead.site.includes('facebook.com') ||
          lead.site.includes('instagram.com') ||
          lead.site.includes('twitter.com') ||
          lead.site.includes('linkedin.com');

        if (isSocialOrInvalid) {
          return { ...lead, websiteContext: '' };
        }

        try {
          const context = await getWebsiteContext(lead.site);
          return { ...lead, websiteContext: context };
        } catch {
          return { ...lead, websiteContext: '' };
        }
      })
    );

    // 3) توليد رسائل واتساب مخصصة لكل عميل بشكل متوازٍ
    const leadsWithAIMessage = await Promise.all(
      leadsWithContext.map(async (lead) => {
        try {
          const hasRealWebsite = lead.websiteContext && lead.websiteContext.length > 20;

          // الـ Prompt الصارم مع دمج سياق الموقع
          const strictPrompt = `
            You are a strict B2B Copywriting robot. You ONLY output the final message. No explanations, no quotes, no conversational filler.

            CRITICAL LANGUAGE RULES:
            1. If the business is located in Morocco: Write the message STRICTLY in Professional French. Do NOT use Arabic, do NOT use Darija, and do NOT mix languages.
            2. If the business is located in Spain: Write the message STRICTLY in Spanish (Castilian).
            3. Never use English words in the message.

            BUSINESS CONTEXT:
            - Name: "${lead.company}"
            - Niche: "${niche}"
            - City: "${location}"

            WEBSITE CONTENT SNAPSHOT:
            ${hasRealWebsite ? `"${lead.websiteContext}"` : 'No website content available.'}

            PERSONALIZATION RULE:
            If the WEBSITE CONTENT SNAPSHOT is available, find ONE specific detail (a service, specialty, or value they mention) and reference it in the message to prove you actually looked at their site. If no website content is available, use your general knowledge about their niche in their city.

            MESSAGE STRUCTURE (Max 2 sentences, under 45 words):
            - Sentence 1: A friendly, professional greeting referencing THEIR specific business/niche detail.
            - Sentence 2: Ask if they are open to automating their customer bookings/leads via a smart WhatsApp assistant.

            OUTPUT EXAMPLE (Morocco, dental clinic with website):
            "Bonjour, j'ai vu que vous proposez des implants dentaires sur votre site. Seriez-vous intéressé par un assistant IA sur WhatsApp pour automatiser la gestion de vos rendez-vous ?"
          `;

          const response = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: strictPrompt }],
            temperature: 0.7,
            max_tokens: 150
          });

          // تنظيف النص من علامات التنصيص والمسافات الزائدة
          let rawMessage = response.choices[0]?.message?.content || '';
          const cleanMessage = cleanAIMessage(rawMessage);

          return {
            ...lead,
            aiMessage: cleanMessage || `مرحباً، رأيت أنكم تعملون في مجال ${niche} في ${location}.`
          };
        } catch (aiError) {
          console.warn(`Failed to generate AI message for ${lead.company}:`, aiError.message);
          return {
            ...lead,
            aiMessage: `مرحباً، رأيت أنكم تعملون في مجال ${niche} في ${location}.`
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      leads: leadsWithAIMessage
    });
  } catch (error) {
    console.error("Controller Error fetching live leads:", error.message);
    res.status(500).json({ success: false, leads: [], error: error.message });
  }
};

// دالة الأتمتة الشاملة المعتمدة على البث الحي (SSE) وقوة Groq
const triggerBulkAutomationSSE = async (req, res) => {
  const { niche, location, tone, selectedLeads } = req.body;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  res.flushHeaders();

  const sendLog = (message, status = 'info', leadId = null) => {
    res.write(`data: ${JSON.stringify({ timestamp: new Date().toLocaleTimeString(), message, status, leadId })}\n\n`);
  };

  const sendHeartbeat = () => {
    res.write(`: heartbeat\n\n`);
  };

  let heartbeatInterval = setInterval(sendHeartbeat, 5000);

  if (!niche || !location || !selectedLeads) {
    sendLog('❌ Error: Missing required campaign configuration.', 'error');
    res.end();
    return;
  }

  sendLog(`⚡ Act 1 & 2: Initializing Groq Intelligence for ${niche} in ${location}...`, 'info');

  try {
    const finalResults = [];

    for (const lead of selectedLeads) {
      try {
        // فحص وجود الموقع الإلكتروني لتحديد الاستراتيجية
        const hasWebsite = lead.site && 
                          !lead.site.includes('facebook.com') && 
                          !lead.site.includes('instagram.com') && 
                          lead.site.trim() !== '';

        let personalizedPrompt = '';
        let emailSubject = '';

        if (!hasWebsite) {
          sendLog(`🌐 Strategy: Website Creation for ${lead.company} (No website)...`, 'processing', lead.id);
          emailSubject = `Propuesta de Diseño Web para ${lead.company}`;
          
          personalizedPrompt = `
            You are an expert digital agency founder in Spain. 
            Write a cold email to "${lead.company}" in the niche of "${niche}" located in "${location}".
            SITUATION: They don't have a professional website.
            PITCH: Compliment their local reputation on Google Maps. Explain how a professional website will double their client bookings.
            Tone: ${tone}. Language: Spanish.
            SENDER: Abdelkrim El Jamiy (Full Stack & Automation Developer).
            Calendar Link: https://calendly.com/eljamiiabdelkarim
            CRITICAL: Return ONLY the raw subject line and email body in Spanish. No introduction like "Here is your email", no formatting blocks, just the text.
          `;
        } else {
          sendLog(`⚙️ Strategy: AI Automation for ${lead.company} (Website: ${lead.site})...`, 'processing', lead.id);
          emailSubject = `Optimización de citas e IA para ${lead.company}`;

          personalizedPrompt = `
            You are an expert AI Automation consultant in Spain. 
            Write a cold email to "${lead.company}" in the niche of "${niche}" located in "${location}".
            SITUATION: They have an active website at "${lead.site}".
            PITCH: Compliment their site, then pitch an AI Appointment Booking chatbot integrated into their site to save 40% of administrative time.
            Tone: ${tone}. Language: Spanish.
            SENDER: Abdelkrim El Jamiy (Full Stack & Automation Developer).
            Calendar Link: https://calendly.com/eljamiiabdelkarim
            CRITICAL: Return ONLY the raw subject line and email body in Spanish. No introduction like "Here is your email", no formatting blocks, just the text.
          `;
        }

        // 🧠 استدعاء محرك Groq فائق السرعة - مع تحديثات حية أثناء الانتظار
        sendLog(`🤖 Contacting Groq AI for ${lead.company}...`, 'processing', lead.id);
        
        let emailContent = '';
        const groqTimeout = setTimeout(() => {
          sendLog(`⏳ Still processing ${lead.company} (AI may take a moment)...`, 'processing', lead.id);
        }, 3000);
        
        try {
          const response = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
              { 
                role: 'user', 
                content: personalizedPrompt 
              }
            ],
            temperature: 0.7,
            max_tokens: 512
          });

          clearTimeout(groqTimeout);
          emailContent = cleanAIMessage(response.choices[0].message.content);
        } catch (groqError) {
          clearTimeout(groqTimeout);
          throw groqError;
        }
        
        sendLog(`✨ AI Copy generated for ${lead.company}!`, 'success', lead.id);
        sendLog(`📝 ${emailContent.substring(0, 100)}...`, 'processing', lead.id);
        sendLog(`✉️ Act 4: Delivering email to ${lead.email}...`, 'processing', lead.id);
        
        // إرسال الإيميل الفعلي عبر الخدمة
        await sendCampaignEmail(lead.email, emailSubject, emailContent.replace(/\n/g, '<br>'));

        // 💾 جمع النتيجة في القائمة النهائية
        finalResults.push({
          company: lead.company,
          email: lead.email,
          status: 'sent',
          error: null
        });

        // حفظ نسخة محلية كنسخة احتياطية
        const currentHistory = JSON.parse(fs.readFileSync(historyFilePath, 'utf8'));
        const newRecord = {
          id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          company: lead.company,
          email: lead.email,
          subject: emailSubject,
          content: emailContent,
          niche: niche,
          location: location,
          date: new Date().toLocaleDateString('es-ES'),
          time: new Date().toLocaleTimeString('es-ES')
        };
        currentHistory.unshift(newRecord);
        fs.writeFileSync(historyFilePath, JSON.stringify(currentHistory, null, 2));

        sendLog(`✅ Success: Dispatched & Logged to History!`, 'success', lead.id);
      } catch (leadError) {
        // جمع النتيجة الفاشلة في القائمة
        finalResults.push({
          company: lead.company,
          email: lead.email || 'N/A',
          status: 'failed',
          error: leadError.message
        });

        sendLog(`❌ Error for ${lead.company}: ${leadError.message}`, 'error', lead.id);
      }
    }

    // 💾 حفظ نتائج الحملة الكاملة في MongoDB
    try {
      await CampaignLog.create({
        niche,
        location,
        tone,
        timestamp: new Date(),
        totalLeads: selectedLeads.length,
        totalSent: finalResults.filter(r => r.status === 'sent').length,
        totalFailed: finalResults.filter(r => r.status === 'failed').length,
        leadsProcessed: finalResults
      });
      sendLog('💾 Campaign results saved permanently to database.', 'done');
    } catch (dbError) {
      console.error('Failed to save to MongoDB:', dbError);
      sendLog(`⚠️ Saved locally but DB save failed: ${dbError.message}`, 'error');
    }

    sendLog('🎉 Act 5: All Campaigns Completed Successfully via Groq!', 'done');
    clearInterval(heartbeatInterval);
    res.end();
  } catch (globalError) {
    clearInterval(heartbeatInterval);
    sendLog(`🚨 Critical Backend Failure: ${globalError.message}`, 'error');
    res.end();
  }
};

// جلب السجل لصفحة الـ History (يجلب من MongoDB أولاً، ثم يوقع احتياطيًا محلي)
const getHistory = async (req, res) => {
  try {
    const dbHistory = await CampaignLog.find().sort({ timestamp: -1 }).limit(100);
    res.status(200).json({ success: true, history: dbHistory });
  } catch (mongoError) {
    console.warn('MongoDB read failed, falling back to local JSON:', mongoError.message);
    try {
      if (!fs.existsSync(historyFilePath)) {
        return res.status(200).json({ success: true, history: [] });
      }
      const data = fs.readFileSync(historyFilePath, 'utf8');
      res.status(200).json({ success: true, history: JSON.parse(data) });
    } catch (fallbackError) {
      res.status(500).json({ success: false, error: fallbackError.message });
    }
  }
};

// جلب إحصائيات الحملات من MongoDB
const getCampaignStats = async (req, res) => {
  try {
    const campaigns = await CampaignLog.find().sort({ timestamp: -1 }).limit(50);
    const totalCampaigns = campaigns.length;
    const totalSent = campaigns.reduce((sum, c) => sum + c.totalSent, 0);
    const totalFailed = campaigns.reduce((sum, c) => sum + c.totalFailed, 0);
    res.status(200).json({ success: true, stats: { totalCampaigns, totalSent, totalFailed, campaigns } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  generateCampaignText,
  getLeads,
  triggerBulkAutomation: triggerBulkAutomationSSE, 
  triggerBulkAutomationSSE,
  getHistory,
  getCampaignStats
};