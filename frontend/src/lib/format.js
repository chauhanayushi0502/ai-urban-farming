const catalogBase = "/assets/images/catalog/";

export function imageSource(image) {
  return image ? `${catalogBase}${image.split("/").map(encodeURIComponent).join("/")}` : `${catalogBase}bg.png`;
}

export function money(value, currency = "₹") {
  return `${currency}${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Category & Product Name Dictionary for Multi-Language Translation
const NAME_DICTIONARY = {
  // Categories
  "indoor plants": { gu: "ઇન્ડોર છોડ", hi: "इनडोर पौधे", en: "Indoor Plants" },
  "outdoor plants": { gu: "આઉટડોર છોડ", hi: "आउटडोर पौधे", en: "Outdoor Plants" },
  "flowering plants": { gu: "ફૂલોના છોડ", hi: "फूलों वाले पौधे", en: "Flowering Plants" },
  "plant care": { gu: "છોડની સંભાળ અને રક્ષણ", hi: "पौधों की देखभाल और सुरक्षा", en: "Plant Care & Protection" },
  "pots & planters": { gu: "કુંડાં અને પ્લાન્ટર્સ", hi: "गमले और प्लांटर्स", en: "Pots & Planters" },
  "seeds & tools": { gu: "બીજ અને ઓજારો", hi: "बीज और उपकरण", en: "Seeds & Tools" },

  // Products
  "money plant": { gu: "મની પ્લાન્ટ", hi: "मनी प्लांट", en: "Money Plant" },
  "snake plant": { gu: "સ્નેક પ્લાન્ટ", hi: "स्नेक प्लांट", en: "Snake Plant" },
  "peace lily": { gu: "પીસ લીલી", hi: "पीस लिली", en: "Peace Lily" },
  "zz plant": { gu: "ZZ પ્લાન્ટ", hi: "ZZ प्लांट", en: "ZZ Plant" },
  "areca palm": { gu: "એરેકા પામ", hi: "एरेका पाम", en: "Areca Palm" },
  "ficus tree": { gu: "ફિકસ ટ્રી", hi: "फिकस ट्री", en: "Ficus Tree" },
  "garden palm": { gu: "રોયલ ગાર્ડન પામ", hi: "रॉयल गार्डन पाम", en: "Royal Garden Palm" },
  "garden shrub": { gu: "એવરગ્રીન ગાર્ડન શ્રબ", hi: "एवरग्रीन गार्डन श्रब", en: "Evergreen Garden Shrub" },
  "hibiscus": { gu: "જાસૂદ / ગુડહલ", hi: "गुडहल / जासूस", en: "Hibiscus" },
  "colorful flower trio": { gu: "એક્ઝોટિક કલરફુલ ફ્લાવર ટ્રીઓ", hi: "एग्जोटिक रंग-बिरंगे फूल", en: "Exotic Colorful Flower Trio" },
  "neem oil": { gu: "શુદ્ધ લીમડાનું તેલ સ્પ્રે", hi: "शुद्ध नीम तेल स्प्रे", en: "Pure Neem Oil Spray (500ml)" },
  "seaweed food": { gu: "લિક્વિડ સીવીડ પ્લાન્ટ ટોનિક", hi: "लिक्विड सीवीड प्लांट टॉनिक", en: "Liquid Seaweed Plant Tonic" },
  "vermicompost": { gu: "જૈવિક વર્મીકમ્પોસ્ટ ખાતર", hi: "जैविक वर्मीकंपोस्ट खाद", en: "Organic Vermicompost (5kg)" },
  "nursery planter": { gu: "નર્સરી ગ્રોઈંગ કુંડું", hi: "नर्सरी ग्रोइंग गमला", en: "Nursery Growing Planter" },
  "self-watering balcony planter": { gu: "સેલ્ફ-વોટરિંગ બાલ્કની પ્લેન્ટર", hi: "सेल्फ-वाटरिंग बालकनी गमला", en: "Self-Watering Balcony Planter" },
  "glazed ceramic pot": { gu: "ગ્લેઝ્ડ સિરામિક કુંડું", hi: "ग्लैज्ड सिरामिक गमला", en: "Glazed Ceramic Pot with Plate" },
  "seeds pack": { gu: "ગાર્ડન સ્ટાર્ટર બીજ કિટ", hi: "गार्डन स्टार्टर बीज किट", en: "Garden Starter Seeds Pack" },
  "garden tools": { gu: "ગાર્ડન ટૂલ્સ સેટ", hi: "गार्डन टूल्स सेट", en: "Garden Tools Set (3 Pcs)" },
};

export function formatNameByLanguage(rawName, language = "en") {
  if (!rawName || typeof rawName !== "string") return "";

  const trimmed = rawName.trim();
  const lower = trimmed.toLowerCase();

  // 1. Direct dictionary match
  for (const [key, map] of Object.entries(NAME_DICTIONARY)) {
    if (lower.includes(key)) {
      return map[language] || map["en"] || trimmed;
    }
  }

  // 2. Parse parenthetical strings like "Gujarati Text (English Text)"
  const match = trimmed.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    const guText = match[1].trim();
    const enText = match[2].trim();

    if (language === "en") {
      return enText.charAt(0).toUpperCase() + enText.slice(1);
    }
    // Gujarati ('gu') or Hindi ('hi') without brackets
    return guText;
  }

  return trimmed;
}