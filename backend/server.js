const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// استيراد المسارات
const campaignRoutes = require('./routes/campaignRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/saas_automation';

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  exposedHeaders: [
    'Content-Type', 
    'Cache-Control', 
    'Connection',
    'X-Accel-Buffering'
  ]
}));
app.use(express.json());

// SSE timeout protection - 10 minutes for long-running automation
app.use((req, res, next) => {
  if (req.path.includes('trigger-bulk-sse')) {
    res.setTimeout(600000);
  }
  next();
});

// ربط مسارات الحملات بالمسار الرئيسي /api/campaigns
app.use('/api/campaigns', campaignRoutes);

// مسار تجريبي
app.get('/', (req, res) => {
    res.send('الخادم يعمل بنجاح وبكفاءة! 🚀');
});

// تشغيل الخادم بعد التأكد من الاتصال بقاعدة البيانات
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Server starting without DB connection (local backup only)');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });