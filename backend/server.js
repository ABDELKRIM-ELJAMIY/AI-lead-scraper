const express = require('express');
const cors = require('cors');
require('dotenv').config();

// استيراد المسارات
const campaignRoutes = require('./routes/campaignRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware

app.use(cors({
  origin: 'http://localhost:5173', // مسار الـ Frontend الخاص بك
  credentials: true,
  exposedHeaders: ['Content-Type', 'Cache-Control', 'Connection'] 
}));app.use(express.json());

// ربط مسارات الحملات بالمسار الرئيسي /api/campaigns
app.use('/api/campaigns', campaignRoutes);

// مسار تجريبي
app.get('/', (req, res) => {
    res.send('الخادم يعمل بنجاح وبكفاءة! 🚀');
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});