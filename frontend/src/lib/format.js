const catalogBase = "/assets/images/catalog/";

export function imageSource(image) {
  if (!image) return `${catalogBase}bg.png`;
  if (image.startsWith("data:") || image.startsWith("http://") || image.startsWith("https://") || image.startsWith("/assets/")) {
    return image;
  }
  return `${catalogBase}${image.split("/").map(encodeURIComponent).join("/")}`;
}

export function money(value, currency = "₹") {
  return `${currency}${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Category & Product Name Dictionary for Multi-Language Translation
export const NAME_DICTIONARY = {
  // Categories
  "indoor plants": { gu: "ઇન્ડોર છોડ", hi: "इनडोर पौधे", en: "Indoor Plants" },
  "indoor plant": { gu: "ઇન્ડોર છોડ", hi: "इनडोर पौधे", en: "Indoor Plants" },
  "outdoor plants": { gu: "આઉટડોર છોડ", hi: "आउटडोर पौधे", en: "Outdoor Plants" },
  "outdoor plant": { gu: "આઉટડોર છોડ", hi: "आउटडोर पौधे", en: "Outdoor Plants" },
  "flowering plants": { gu: "ફૂલોના છોડ", hi: "फूलों वाले पौधे", en: "Flowering Plants" },
  "flowering plant": { gu: "ફૂલોના છોડ", hi: "फूलों वाले पौधे", en: "Flowering Plants" },
  "plant care & protection": { gu: "છોડની સંભાળ અને રક્ષણ", hi: "पौधों की देखभाल और सुरक्षा", en: "Plant Care & Protection" },
  "plant care": { gu: "છોડની સંભાળ અને રક્ષણ", hi: "पौधों की देखभाल और सुरक्षा", en: "Plant Care & Protection" },
  "pots & planters": { gu: "કુંડાં અને પ્લાન્ટર્સ", hi: "गमले और प्लांटर्स", en: "Pots & Planters" },
  "pots & planter": { gu: "કુંડાં અને પ્લાન્ટર્સ", hi: "गमले और प्लांटर्स", en: "Pots & Planters" },
  "seeds & tools": { gu: "બીજ અને ઓજારો", hi: "बीज और उपकरण", en: "Seeds & Tools" },
  "seeds & tool": { gu: "બીજ અને ઓજારો", hi: "बीज और उपकरण", en: "Seeds & Tools" },

  // Products
  "money plant": { gu: "મની પ્લાન્ટ", hi: "मनी प्लांट", en: "Money Plant (Devil's Ivy)" },
  "snake plant": { gu: "સ્નેક પ્લાન્ટ", hi: "स्नेक प्लांट", en: "Snake Plant (Sansevieria)" },
  "peace lily": { gu: "પીસ લીલી", hi: "पीस लिली", en: "Peace Lily (Spathiphyllum)" },
  "zz plant": { gu: "ZZ પ્લાન્ટ", hi: "ZZ प्लांट", en: "ZZ Plant" },
  "areca palm": { gu: "એરેકા પામ", hi: "एरेका पाम", en: "Areca Palm Houseplant" },
  "lush indoor": { gu: "લશ ઇન્ડોર ફોલિએજ છોડ", hi: "लश इनडोर पत्तेदार पौधा", en: "Lush Indoor Foliage Plant" },
  "ficus tree": { gu: "ફિકસ ટ્રી", hi: "फिकस ट्री", en: "Ficus Tree (Weeping Fig)" },
  "royal garden palm": { gu: "રોયલ ગાર્ડન પામ", hi: "रॉयल गार्डन पाम", en: "Royal Garden Palm" },
  "garden palm": { gu: "રોયલ ગાર્ડન પામ", hi: "रॉयल गार्डन पाम", en: "Royal Garden Palm" },
  "evergreen garden shrub": { gu: "એવરગ્રીન ગાર્ડન શ્રબ", hi: "एवरग्रीन गार्डन श्रब", en: "Evergreen Garden Shrub" },
  "garden shrub": { gu: "એવરગ્રીન ગાર્ડન શ્રબ", hi: "एवरग्रीન गार्डन श्रब", en: "Evergreen Garden Shrub" },
  "sun-loving patio": { gu: "સન-લવિંગ પેશિયો ટ્રી", hi: "सन-लविंग आँगन का पेड़", en: "Sun-Loving Patio Accent Tree" },
  "hibiscus": { gu: "જાસૂદ (ગુડહલ)", hi: "गुडहल (हिबिस्कस)", en: "Hibiscus (Gudhal - Tropical Red)" },
  "flowering trio": { gu: "એક્ઝોટિક કલરફુલ ફ્લાવર ટ્રીઓ", hi: "एग्जोटिक रंग-बिरंगे फूल", en: "Exotic Flowering Trio" },
  "colorful flower": { gu: "એક્ઝોટિક કલરફુલ ફ્લાવર ટ્રીઓ", hi: "एग्जोटिक रंग-बिरंगे फूल", en: "Exotic Flowering Trio" },
  "fragrant terrace blossom": { gu: "સુગંધિત ટેરેસ બ્લોસમ છોડ", hi: "सुगंधित छत का फूल वाला पौधा", en: "Fragrant Terrace Blossom Plant" },
  "blossom": { gu: "સુગંધિત ટેરેસ બ્લોસમ છોડ", hi: "सुगंधित छत का फूल वाला पौधा", en: "Fragrant Terrace Blossom Plant" },
  "neem oil": { gu: "શુદ્ધ લીમડાનું તેલ સ્પ્રે (500ml)", hi: "शुद्ध नीम तेल स्प्रे (500ml)", en: "Pure Neem Oil Spray (500ml)" },
  "seaweed": { gu: "લિક્વિડ સીવીડ પ્લાન્ટ ટોનિક", hi: "लिक्विड सीवीड प्लांट टॉनिक", en: "Liquid Seaweed Plant Tonic" },
  "vermicompost": { gu: "જૈવિક વર્મીકમ્પોસ્ટ ખાતર (5kg)", hi: "जैविक वर्मीकंपोस्ट खाद (5kg)", en: "Organic Vermicompost Soil Food (5kg)" },
  "plant booster": { gu: "બાયો-એક્ટિવ પ્લાન્ટ બૂસ્ટર", hi: "बायो-एक्टिव प्लांट बूस्टर", en: "Bio-Active Plant Booster & Root Stimulator" },
  "root stimulator": { gu: "બાયો-એક્ટિવ પ્લાન્ટ બૂસ્ટર", hi: "बायो-एक्टिव प्लांट बूस्टर", en: "Bio-Active Plant Booster & Root Stimulator" },
  "eco-clay": { gu: "ઇકો-ક્લે બ્રીધેબલ નર્સરી કુંડું", hi: "इको-क्ले सांस लेने योग्य नर्सरी गमला", en: "Eco-Clay Breathable Nursery Planter (8-inch)" },
  "nursery planter": { gu: "નર્સરી ગ્રોઈંગ કુંડું", hi: "नर्सरी ग्रोइंग गमला", en: "Nursery Growing Planter" },
  "self-watering": { gu: "સેલ્ફ-વોટરિંગ બાલ્કની પ્લાન્ટર", hi: "सेल्फ-वाटरिंग बालकनी गमला", en: "Self-Watering Balcony Planter" },
  "glazed artisan": { gu: "ગ્લેઝ્ડ સિરામિક કુંડું પ્લેટ સાથે", hi: "ग्लैज्ड सिरामिक गमला प्लेट के साथ", en: "Glazed Artisan Ceramic Planter with Saucer" },
  "ceramic planter": { gu: "ગ્લેઝ્ડ સિરામિક કુંડું પ્લેટ સાથે", hi: "ग्लैज्ड सिरामिक गमला प्लेट के साथ", en: "Glazed Ceramic Planter" },
  "textured minimalist": { gu: "ટેક્ષ્ચરડ મિનિમલિસ્ટ રાઉન્ડ કુંડું", hi: "टेक्सचर्ड मिनिमलिस्ट गोल गमला", en: "Textured Minimalist Round Planter (10-inch)" },
  "round planter": { gu: "ટેક્ષ્ચરડ મિનિમલિસ્ટ રાઉન્ડ કુંડું", hi: "टेक्सचर्ड मिनिमलिस्ट गोल गमला", en: "Textured Minimalist Round Planter" },
  "kitchen garden": { gu: "કિચન ગાર્ડન સ્ટાર્ટર બીજ કિટ", hi: "किचन गार्डन स्टार्टर बीज किट", en: "Kitchen Garden Starter Seeds Pack" },
  "seeds pack": { gu: "ગાર્ડન સ્ટાર્ટર બીજ કિટ", hi: "गार्डन स्टार्टर बीज किट", en: "Kitchen Garden Starter Seeds Pack" },
  "hand tools": { gu: "અર્ગોનોમિક ગાર્ડન ટૂલ્સ સેટ (3 પીસ)", hi: "एर्गोनोमिक गार्डन टूल्स सेट (3 पीस)", en: "Heavy-Duty Ergonomic Garden Hand Tools (3-Piece)" },
  "garden tools": { gu: "ગાર્ડન ટૂલ્સ સેટ", hi: "गार्डन टूल्स सेट", en: "Heavy-Duty Garden Hand Tools (3-Piece)" },
};

// Descriptions dictionary
export const DESCRIPTION_DICTIONARY = {
  "money plant": {
    gu: "ચમકદાર અને સુંદર હૃદય આકારના પાંદડાવાળો વેલો. હવા શુદ્ધ કરનાર અને પરોક્ષ પ્રકાશમાં ખૂબ જ સારો ઉગે છે.",
    hi: "चमकदार दिल के आकार के पत्तों वाली खूबसूरत बेल। हवा को शुद्ध करता है और अप्रत्यक्ष प्रकाश में तेजी से बढ़ता है।",
    en: "A graceful trailing plant with glossy, variegated heart-shaped leaves. Air-purifying and thrives in indirect light.",
  },
  "snake plant": {
    gu: "સીધા પાંદડાવાળો મજબૂત છોડ જે રાત્રે પણ ઓક્સિજન આપે છે. ઓછાં પાણીમાં અને ઘરના ખૂણામાં ખૂબ સરળતાથી જીવે છે.",
    hi: "मजबूत और सीधा पौधा जो रात में भी ऑक्सीजन छोड़ता है। कम पानी में भी स्वस्थ और हरा-भरा रहता है।",
    en: "A sculptural, upright plant that releases oxygen at night. Forgiving of missed waterings and drought-tolerant.",
  },
  "peace lily": {
    gu: "સફેદ સુંદર ફૂલો અને લીલા પાંદડા સાથે મનને શાંતિ આપતો ઇન્ડોર છોડ, જે ઘરની હવા સાફ રાખવામાં ઉત્તમ છે.",
    hi: "सफेद फूलों और गहरे हरे पत्तों वाला इनडोर पौधा जो घर की हवा को शुद्ध और वातावरण को शांत रखता है।",
    en: "Soft white blooms and deep green leaves make this a calm air-purifying favorite for bright indoor spaces.",
  },
  "zz plant": {
    gu: "ઓછા પ્રકાશ અને ઓછા પાણીમાં પણ લીલાછમ ચમકદાર પાંદડા જાળવી રાખતો સૌથી ટકાઉ ઇન્ડોર છોડ.",
    hi: "कम रोशनी और कम पानी में भी चमकदार हरे पत्तों वाला सबसे सहनशील इनडोर पौधा।",
    en: "Glossy emerald foliage that thrives in low light, stores moisture efficiently, and needs minimal watering.",
  },
  "areca palm": {
    gu: "કુદરતી રીતે ઘરમાં ભેજ જાળવી રાખનાર અને લિવિંગ રૂમને સુંદર ઉષ્ણકટિબંધીય લુક આપનાર પામ છોડ.",
    hi: "घर में प्राकृतिक नमी बनाए रखने और कमरों को खूबसूरत हरियाली देने वाला पसंदीदा पाम पौधा।",
    en: "Feathery, arching tropical fronds that naturally humidify room air and soften bright living areas.",
  },
  "lush indoor": {
    gu: "સ્ટડી ડેસ્ક, ટેબલ અને બારી પાસે મૂકવા માટે યોગ્ય કદનો સુંદર અને તાજો ઇન્ડોર છોડ.",
    hi: "स्टडी टेबल और खिड़कियों के पास रखने के लिए उपयुक्त ताजा और सुंदर इनडोर पौधा।",
    en: "A compact, vibrant indoor accent plant suited for study desks, side tables, and filtered window corners.",
  },
  "ficus tree": {
    gu: "મજબૂત થડ અને સુંદર છત્ર ધરાવતો આઉટડોર આકર્ષક છોડ જે બગીચા કે બાલ્કનીની શોભા વધારે છે.",
    hi: "मजबूत तने और घनी छतरी वाला खूबसूरत आउटडोर पौधा जो बगीचे और बालकनी की शोभा बढ़ाता है।",
    en: "A leafy outdoor statement plant with a strong architectural trunk and a lush, weeping canopy.",
  },
  "royal garden palm": {
    gu: "સુંદર અને સપ્રમાણ પાંદડા ધરાવતો આઉટડોર પામ જે તડકાવાળી અગાસી કે બાલ્કની માટે ઉત્તમ છે.",
    hi: "धूप वाली छतों और बालकनी के लिए आदर्श खूबसूरत पत्तों वाला आउटडोर पाम पौधा।",
    en: "Stately outdoor garden palm with symmetrical fronds, ideal for sunny terraces and balcony focal points.",
  },
  "evergreen garden shrub": {
    gu: "ઉનાળા અને ચોમાસામાં પણ હરિયાળો રહેતો અને તડકો સહન કરી શકતો ટકાઉ બગીચાનો છોડ.",
    hi: "गर्मियों और बारिश में भी हरा-भरा रहने वाला और धूप सहन करने वाला मजबूत सजावटी पौधा।",
    en: "A sun-hardy ornamental foliage shrub that stays verdant throughout hot summer and monsoon seasons.",
  },
  "hibiscus": {
    gu: "લાલ અને આકર્ષક ફૂલો આપતો સૂર્યપ્રેમી છોડ જે બગીચામાં પતંગિયા અને પક્ષીઓને આકર્ષે છે.",
    hi: "गहरे लाल फूलों वाला धूप-प्रेमी पौधा जो बगीचे में तितलियों और चिड़ियों को आकर्षित करता है।",
    en: "A sun-loving flowering plant with vivid red and coral blooms that attract helpful garden pollinators.",
  },
  "flowering trio": {
    gu: "સતત નવી કળીઓ અને રંગબેરંગી ફૂલો આપતો છોડ જે તમારી બાલ્કનીમાં ખુશીઓ ભરી દેશે.",
    hi: "लगातार खिलने वाले रंग-बिरंगे फूलों का समूह जो बालकनी को हमेशा जीवंत रखता है।",
    en: "Dense flowering cluster with continuous seasonal buds for vibrant color on your balcony or patio.",
  },
  "neem oil": {
    gu: "કુદરતી કોલ્ડ-પ્રેસ્ડ જૈવિક કીટનાશક અને ફૂગનાશક સ્પ્રે. પાંદડાના રોગો, ફૂગ અને જીવાત પર 100% અસરકારક.",
    hi: "प्राकृतिक कोल्ड-प्रेस्ड जैविक कीटनाशक और फफूंदनाशक स्प्रे। पत्तों के रोगों और कीड़ों से पूर्ण सुरक्षा।",
    en: "Organic cold-pressed bio-pesticide and fungicide. Effectively controls leaf blight, powdery mildew, aphids, and mites.",
  },
  "seaweed": {
    gu: "100% કુદરતી માઇક્રો-ન્યુટ્રિઅન્ટ અને પ્લાન્ટ પ્રોટીન ટોનિક. મૂળની મજબૂતી અને પાંદડાની ચમક વધારે છે.",
    hi: "100% प्राकृतिक सूक्ष्म पोषक तत्व और प्रोटीन टॉनिक। जड़ों को मजबूत और पत्तों को चमकदार बनाता है।",
    en: "100% natural micro-nutrient and plant protein tonic. Promotes lush chlorophyll, root vigor, and immunity.",
  },
  "vermicompost": {
    gu: "અળસિયાનું શુદ્ધ ખાતર જે જમીનમાં ભેજ જાળવી રાખે છે અને છોડને સંપૂર્ણ પોષણ પૂરું પાડે છે.",
    hi: "शुद्ध केंचुआ खाद जो मिट्टी की जल धारण क्षमता बढ़ाती है और संपूर्ण जैविक पोषण देती है।",
    en: "Pure earthworm casting compost that improves soil water retention, aeration, and delivers organic nutrition.",
  },
  "plant booster": {
    gu: "જમીનના સૂક્ષ્મ જીવોને ઉત્તેજિત કરતું અને નવા મૂળના વિકાસને ઝડપી બનાવતું જૈવિક ગ્રોથ બૂસ્ટર.",
    hi: "मिट्टी के जीवन को समृद्ध करने और नई जड़ों के तेजी से विकास को प्रेरित करने वाला जैविक बूस्टर।",
    en: "Concentrated organic growth catalyst that enriches soil microbial life and accelerates healthy root establishment.",
  },
  "eco-clay": {
    gu: "માટીનું છિદ્રાળુ કુંડું જે મૂળ સુધી હવા પહોંચાડે છે અને છોડને સ્વસ્થ રાખે છે.",
    hi: "सांस लेने योग्य मिट्टी का गमला जो जड़ों तक हवा पहुंचाता है और पौधों को स्वस्थ रखता है।",
    en: "A simple porous clay planter for giving growing seedlings and repotted house plants a comfortable home.",
  },
  "self-watering": {
    gu: "સ્માર્ટ વોટરિંગ સિસ્ટમવાળું કુંડું જે પાણીના સ્તરનું સૂચન કરે છે જેથી મૂળ સડવાથી બચી જાય.",
    hi: "स्मार्ट सब-इरिगेशन गमला जो पानी के सही स्तर को बनाए रखता है और जड़ों को सड़ने से बचाता है।",
    en: "Smart sub-irrigation planter with a water level indicator to maintain optimal moisture without root rot.",
  },
  "glazed artisan": {
    gu: "તાપમાનના ફેરફારોથી મૂળને બચાવતું ડ્રેનેજ હોલ અને પ્લેટવાળું કલાત્મક સિરામિક કુંડું.",
    hi: "ड्रेनेज होल और प्लेट के साथ हस्तनिर्मित सिरामिक गमला जो जड़ों को तापमान से सुरक्षित रखता है।",
    en: "High-fired artisan breathable ceramic container with drainage hole to protect roots from temperature swings.",
  },
  "kitchen garden": {
    gu: "ઘરે તાજી શાકભાજી માટે તુલસી, ચેરી ટમેટા અને ધાણાના દેશી ઓર્ગેનિક બીજનું પેક.",
    hi: "घर पर ताजी सब्जी के लिए इटैलियन बेसिल, चेरी टमाटर और धनिए के देशी जैविक बीजों का पैक।",
    en: "Organic heirloom seed pack containing Italian sweet basil, cherry tomato, and cilantro for home harvesting.",
  },
  "hand tools": {
    gu: "રબર ગ્રિપવાળા મજબૂત સ્ટેનલેસ-સ્ટીલના 3 ઓજારો જે છોડ વાવવામાં સરળતા આપે છે.",
    hi: "मजबूत स्टेनलेस-स्टील और रबर ग्रिप वाले 3 बागवानी उपकरण जो आसानी से काम करने में मदद करते हैं।",
    en: "Stainless-steel trowel, cultivator rake, and transplanter with rubber grips for effortless potting and aerating.",
  },
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

export function formatDescriptionByLanguage(rawDesc, language = "en", rawName = "") {
  if (language === "en") return rawDesc || "";
  
  const searchKey = `${rawName || ""} ${rawDesc || ""}`.toLowerCase();
  for (const [key, map] of Object.entries(DESCRIPTION_DICTIONARY)) {
    if (searchKey.includes(key)) {
      return map[language] || rawDesc || "";
    }
  }

  return rawDesc || "";
}