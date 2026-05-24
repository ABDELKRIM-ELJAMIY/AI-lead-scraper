const express = require('express');
const router = express.Router();
const { 
  generateCampaignText, 
  triggerBulkAutomation, 
  getLeads,
  getHistory,
  getCampaignStats
} = require('../controllers/campaignController');

// 1. مسار جلب قائمة العملاء (لوحة التحكم)
router.get('/leads', getLeads);

// 2. مسار التوليد الفردي القديم (الاختبار)
router.post('/generate', generateCampaignText);

// 3. مسار الأتمتة الجماعية الذكي (العملاء المحددين فقط) - المسار الجديد SSE
router.post('/trigger-bulk-sse', triggerBulkAutomation);

// 4. مسار جلب سجل الرسائل المرسلة
router.get('/history', getHistory);

// 5. مسار جلب إحصائيات الحملات
router.get('/stats', getCampaignStats);

module.exports = router;
