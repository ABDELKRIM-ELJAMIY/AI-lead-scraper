const express = require('express');
const router = express.Router();
const { 
  generateCampaignText, 
  triggerBulkAutomation, 
  getLeads 
} = require('../controllers/campaignController');

// 1. مسار جلب قائمة العملاء (لوحة التحكم)
router.get('/leads', getLeads);

// 2. مسار التوليد الفردي القديم (الاختبار)
router.post('/generate', generateCampaignText);

// 3. مسار الأتمتة الجماعية الذكي (العملاء المحددين فقط)
router.post('/automation-bulk', triggerBulkAutomation);

module.exports = router;