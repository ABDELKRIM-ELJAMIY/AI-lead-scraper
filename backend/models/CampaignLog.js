const mongoose = require('mongoose');

const CampaignLogSchema = new mongoose.Schema({
  niche: String,
  location: String,
  tone: String,
  timestamp: { type: Date, default: Date.now },
  totalLeads: Number,
  totalSent: Number,
  totalFailed: Number,
  leadsProcessed: [
    {
      company: String,
      email: String,
      status: String,
      error: String
    }
  ]
});

module.exports = mongoose.model('CampaignLog', CampaignLogSchema);
