// 1. استيراد خدمة SerpApi للخرائط الحية التي قمنا ببنائها سابقاً
const { fetchRealLeadsFromMaps } = require('../services/mapsService');
const openai = require('../config/openai');
const { sendCampaignEmail } = require('../services/emailService');

// توليد نص لحملة فردية
const generateCampaignText = async (req, res) => {
  try {
    const { productName, targetAudience, tone, recipientEmail } = req.body;
    res.status(200).json({ success: true, message: "Use bulk automation for campaigns." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// جلب قائمة العملاء الحية من SerpApi (Google Maps)
const getLeads = async (req, res) => {
  try {
    const { niche, location } = req.query;
    
    // إذا لم يحدد المستخدم نيتش أو موقع، نرجع مصفوفة فارغة لحماية الكريديت من الاستهلاك
    if (!niche || !location) {
      return res.status(200).json({ 
        success: true, 
        leads: [] 
      });
    }

    // استدعاء الخدمة الحية المستوردة في الأعلى بشكل سليم الآن
    const liveLeads = await fetchRealLeadsFromMaps(niche, location);
    
    // التأكد من أن النتيجة مصفوفة دائماً لحماية الفرونت إند
    res.status(200).json({ 
      success: true, 
      leads: Array.isArray(liveLeads) ? liveLeads : [] 
    });

  } catch (error) {
    console.error("Controller Error fetching live leads:", error.message);
    res.status(500).json({ 
      success: false, 
      leads: [], 
      error: error.message 
    });
  }
};

// دالة الـ Bulk Automation المطورة المعتمدة على الـ Streaming (SSE)
const triggerBulkAutomationSSE = async (req, res) => {
  const { niche, location, tone, selectedLeads } = req.body;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  const sendLog = (message, status = 'info', leadId = null) => {
    res.write(`data: ${JSON.stringify({ timestamp: new Date().toLocaleTimeString(), message, status, leadId })}\n\n`);
    if (res.flush) res.flush();
  };

  if (!niche || !location || !selectedLeads) {
    sendLog('❌ Error: Missing Niche, Location, or Leads.', 'error');
    res.end();
    return;
  }

  sendLog(`⚡ Act 1 & 2: Initializing automation for ${niche} in ${location}...`, 'info');

  try {
    for (const lead of selectedLeads) {
      try {
        sendLog(`🧠 Act 3: Crafting personalized copy for ${lead.company}...`, 'processing', lead.id);

        const personalizedPrompt = `
          You are an expert B2B copywriter in Spain. 
          You are reaching out to a company named "${lead.company}" in the niche of "${niche}" located in "${location}".
          
          THE PITCH:
          - Compliment their business specifically based on their name/context.
          - Smoothly pitch how our AI Appointment Booking system can save them 40% of administrative time.
          - Tone: ${tone}. Language: Spanish.
          
          SENDER: "Abdelkrim El Jamiy", "Full Stack & Automation Developer".
          Calendar: "https://calendly.com/eljamiiabdelkarim".
          
          REQUIREMENTS: No placeholders, output ONLY the email body (Subject + Message).
        `;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: personalizedPrompt }],
          temperature: 0.7,
        });

        const emailContent = response.choices[0].message.content;
        
        sendLog(`✉️ Act 4: Delivering email to ${lead.email}...`, 'processing', lead.id);
        await sendCampaignEmail(lead.email, `Optimización de citas para ${lead.company}`, emailContent.replace(/\n/g, '<br>'));

        sendLog(`✅ Success: Dispatched to ${lead.company}!`, 'success', lead.id);
      } catch (leadError) {
        sendLog(`❌ Error for ${lead.company}: ${leadError.message}`, 'error', lead.id);
      }
    }

    sendLog('🎉 Act 5: Campaign Completed Successfully!', 'done');
    res.end();
  } catch (globalError) {
    sendLog(`🚨 Critical Failure: ${globalError.message}`, 'error');
    res.end();
  }
};

module.exports = {
  generateCampaignText,
  getLeads,
  triggerBulkAutomation: triggerBulkAutomationSSE, 
  triggerBulkAutomationSSE
};