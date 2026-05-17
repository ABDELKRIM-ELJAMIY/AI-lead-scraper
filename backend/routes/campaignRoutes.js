const express = require('express');
const router = express.Router();
const { generateCampaignText } = require('../controllers/campaignController');

router.post('/generate', generateCampaignText);

module.exports = router;
