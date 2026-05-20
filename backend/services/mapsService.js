const { getJson } = require("serpapi");

/**
 * جلب الشركات الحية من خرائط جوجل باستخدام SerpApi المجاني
 */
const fetchRealLeadsFromMaps = async (niche, location) => {
  const apiKey = process.env.SERP_API_KEY;
  if (!apiKey) {
    throw new Error("SerpApi API Key is missing in .env file");
  }

  try {
    console.log(`🌐 SerpApi: Searching Google Maps for "${niche} in ${location}"...`);
    
    // إرسال الطلب لـ SerpApi المخصص لخرائط جوجل
    const response = await getJson({
      engine: "google_maps",
      q: `${niche} ${location}`,
      api_key: apiKey,
      hl: "es", // لغة البحث (إسبانيا)
    });

    const localResults = response.local_results || [];

    if (localResults.length === 0) {
      console.log("⚠️ No local results found on Google Maps via SerpApi.");
      return [];
    }

    // تنسيق البيانات لتتطابق مع جدول الـ React تماماً
    return localResults.map((place, index) => {
      let fallbackEmail = `contact@${place.title.toLowerCase().replace(/[^a-z0-9]/g, '')}.es`;
      
      // إذا كان لديهم موقع إلكتروني، نصنع إيميل احترافي بناءً على الدومين
      if (place.website) {
        const domain = place.website.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
        fallbackEmail = `info@${domain}`;
      }

      return {
        id: place.place_id || `serp-${index}-${Date.now()}`,
        company: place.title || "Unknown Business",
        niche: niche,
        location: place.address || location,
        phone: place.phone || "No Phone",
        site: place.website || null,
        email: fallbackEmail // الإيميل الافتراضي الذكي المبني على الدومين للحملات التسويقية
      };
    });

  } catch (error) {
    console.error("❌ SerpApi Service Error:", error.message);
    throw error;
  }
};

module.exports = { fetchRealLeadsFromMaps };