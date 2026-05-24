const axios = require('axios');
const cheerio = require('cheerio');

/**
 * استخراج نص مختصر من صفحة الموقع الرئيسية أو About Us
 * يستخدم User-Agent متقدم لتجنب الحظر من قبل جدار الحماية للموقع
 */
const getWebsiteContext = async (url) => {
  if (!url) return '';

  try {
    const { data } = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
      },
    });

    const $ = cheerio.load(data);

    // إزالة العناصر غير الضرورية (nav, footer, script, style)
    $('nav, footer, script, style, noscript, iframe, svg').remove();

    // استخراج النصوص من الفقرات والعناوين والصور alt
    let context = $('p, h1, h2, h3, img[alt]').text();

    // تنظيف النص
    context = context
      .replace(/\s+/g, ' ')
      .replace(/\n/g, ' ')
      .trim()
      .substring(0, 1000);

    return context || 'No readable content found on website.';
  } catch (err) {
    console.warn(`Website context extraction failed for ${url}:`, err.message);
    return 'No specific content found.';
  }
};

module.exports = { getWebsiteContext };
