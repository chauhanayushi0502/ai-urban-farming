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
  "desiccated nursery plant": { gu: "સૂકાયેલો નર્સરી છોડ", hi: "सूखा हुआ नर्सरी पौधा", en: "Desiccated Nursery Plant" },
  "desiccated": { gu: "સૂકાયેલો છોડ", hi: "सूखा पौधा", en: "Desiccated Plant" },
  "nursery plant": { gu: "નર્સરી છોડ", hi: "नर्सरी पौधा", en: "Nursery Plant" },
  "rose": { gu: "ગુલાબનો છોડ", hi: "गुलाब का पौधा", en: "Rose Plant" },
  "tulsi": { gu: "તુલસીનો છોડ", hi: "तुलसी का पौधा", en: "Tulsi (Holy Basil)" },
  "holy basil": { gu: "તુલસીનો છોડ", hi: "तुलसी का पौधा", en: "Tulsi (Holy Basil)" },
  "aloe vera": { gu: "એલોવેરા (કુંવારપાઠું)", hi: "एलोवेरा (घृतकुमारी)", en: "Aloe Vera" },
  "aloe": { gu: "એલોવેરા (કુંવારપાઠું)", hi: "एलोवेरा (घृतकुमारी)", en: "Aloe Vera" },
  "mint": { gu: "ફુદીનો", hi: "पुदीना", en: "Mint (Pudina)" },
  "pudina": { gu: "ફુદીનો", hi: "पुदीना", en: "Mint (Pudina)" },
  "coriander": { gu: "કોથમરી (ધાણા)", hi: "धनिया", en: "Coriander" },
  "tomato": { gu: "ટમેટાં", hi: "टमाटर", en: "Tomato" },
  "pepper": { gu: "મરચાં / શિમલા મરચાં", hi: "शिमला मिर्च", en: "Bell Pepper" },
  "chili": { gu: "લીલાં મરચાં", hi: "हरी मिर्च", en: "Green Chili" },
  "chilli": { gu: "લીલાં મરચાં", hi: "हरी मिर्च", en: "Green Chili" },
  "sweet basil": { gu: "તુલસી (મીઠો બેસિલ)", hi: "मीठा तुलसी (बेसिल)", en: "Sweet Basil" },
  "basil": { gu: "તુલસી / બેસિલ", hi: "बेसिल (तुलसी)", en: "Sweet Basil" },
  "chili pepper": { gu: "મરચાંનો છોડ", hi: "मिर्च का पौधा", en: "Chili Pepper" },
  "marigold": { gu: "ગલગોટો (હજારી ગલ)", hi: "गेंदा का फूल", en: "Marigold" },
  "genda": { gu: "ગલગોટો (હજારી ગલ)", hi: "गेंदा का फूल", en: "Marigold" },
  "borage": { gu: "બોરેજ (સ્ટારફ્લાવર)", hi: "बोरेज (स्टारफ्लावर)", en: "Borage" },
  "strawberry": { gu: "સ્ટ્રોબેરી", hi: "स्ट्रॉबेरी", en: "Strawberry" },
  "garlic": { gu: "લસણ", hi: "लहसुन", en: "Garlic" },
  "onion": { gu: "ડુંગળી (કાંદા)", hi: "प्याज", en: "Onion" },
  "cucumber": { gu: "કાકડી", hi: "खीरा", en: "Cucumber" },
  "spinach": { gu: "પાલક", hi: "पालक", en: "Spinach" },
  "bonsai tree": { gu: "બોન્સાઈ ટ્રી", hi: "बोन्साई का पेड़", en: "Bonsai Tree" },
  "bonsai": { gu: "બોન્સાઈ ટ્રી", hi: "बोन्साई का पेड़", en: "Bonsai Tree" },
  "rosemary": { gu: "રોઝમેરી", hi: "रोज़मेरी", en: "Rosemary" },
  "thyme": { gu: "થાઇમ (અજમાના પાન)", hi: "थाइम (अजवाइन के पत्ते)", en: "Thyme" },
  "oregano": { gu: "ઓરેગાનો", hi: "ऑरेगैनो", en: "Oregano" },
  "parsley": { gu: "પાર્સલી (અજમોદ)", hi: "पार्सले (अजमोद)", en: "Parsley" },
  "fennel": { gu: "વરિયાળી", hi: "सौंफ", en: "Fennel" },
  "potato": { gu: "બટાકા", hi: "आलू", en: "Potato" },
  "cabbage": { gu: "કોબીજ", hi: "पत्तागोभी", en: "Cabbage" },
  "lavender": { gu: "લેવેન્ડર", hi: "लैवेंडर", en: "Lavender" },
  "dill": { gu: "સુવા દાણા (સુવા)", hi: "सोया (सुवा)", en: "Dill" },
  "radish": { gu: "મૂળો", hi: "मूली", en: "Radish" },
  "monstera": { gu: "મોન્સ્ટેરા", hi: "मॉन्स्टेरा", en: "Monstera Deliciosa" },
  "kohlrabi": { gu: "ગાંઠગોબી (નવલકોલ)", hi: "गांठ गोभी", en: "Kohlrabi" },
  "pole beans": { gu: "વાલ / ચોળીના વેલા", hi: "सेम की फली", en: "Pole Beans" },
  "spearmint": { gu: "ફુદીનો (સ્પિયરમિન્ટ)", hi: "पुदीना", en: "Spearmint" },
  "garden houseplant": { gu: "બગીચાનો ઇન્ડોર છોડ", hi: "बगीचे का इनडोर पौधा", en: "Garden Houseplant" },
  "houseplant": { gu: "ઇન્ડોર છોડ", hi: "इनडोर पौधा", en: "Houseplant" },
  "jasmine": { gu: "ચમેલી / મોગરો", hi: "चमेली / मोगरा", en: "Jasmine Plant" },
  "mogra": { gu: "મોગરો", hi: "मोगरा", en: "Mogra Plant (Arabian Jasmine)" },
  "bougainvillea": { gu: "બોગનવેલ", hi: "बोगनवेलिया", en: "Bougainvillea" },
  "champa": { gu: "ચંપો (પ્લુમેરિયા)", hi: "चंपा का पौधा", en: "Champa (Plumeria)" },
  "fern": { gu: "બોસ્ટન ફર્ન", hi: "बोस्टन फर्न", en: "Boston Fern" },
  "jade plant": { gu: "જેડ પ્લાન્ટ (લકી પ્લાન્ટ)", hi: "जेड प्लांट (भाग्यशाली पौधा)", en: "Jade Plant (Crassula)" },
  "jade": { gu: "જેડ પ્લાન્ટ", hi: "जेड प्लांट", en: "Jade Plant" },
  "succulent": { gu: "સુક્યુલન્ટ છોડ", hi: "सक्यूलेंट पौधा", en: "Exotic Succulent" },
  "cactus": { gu: "થોર / કેક્ટસ", hi: "कैक्टस", en: "Cactus Specimen" },
  "bamboo": { gu: "લકી બામ્બૂ પ્લાન્ટ", hi: "लकी बैम्बू पौधा", en: "Lucky Bamboo Plant" },
  "rubber plant": { gu: "રબર પ્લાન્ટ", hi: "रबर का पौधा", en: "Rubber Plant (Ficus elastica)" },
  "calathea": { gu: "કેલેથિયા પ્રેયર પ્લાન્ટ", hi: "कैलेथिया पौधा", en: "Calathea Prayer Plant" },
  "philodendron": { gu: "ફિલોડેન્ડ્રોન", hi: "फिलोडेन्ड्रॉन", en: "Philodendron Houseplant" },
  "aglaonema": { gu: "અગ્લાઓનેમા (ચાઇનીઝ એવરગ્રીન)", hi: "एग्लोनिमा", en: "Aglaonema Chinese Evergreen" },
  "curry leaves": { gu: "મીઠો લીમડો (કઢી પત્તા)", hi: "मीठा नीम (कढ़ी पत्ता)", en: "Curry Leaves Plant" },
  "curry leaf": { gu: "મીઠો લીમડો (કઢી પત્તા)", hi: "मीठा नीम (कढ़ी पत्ता)", en: "Curry Leaves Plant" },
  "lemon": { gu: "લીંબુનો છોડ", hi: "नींबू का पौधा", en: "Lemon Tree / Lime Plant" },
  "lime": { gu: "લીંબુનો છોડ", hi: "नींबू का पौधा", en: "Lemon Tree / Lime Plant" },
  "mango": { gu: "આંબાનો કલમી છોડ", hi: "आम का कलमी पौधा", en: "Grafted Mango Plant" },
  "guava": { gu: "જામફળનો છોડ", hi: "अमरूद का पौधा", en: "Guava Plant" },
  "perlite": { gu: "પરલાઇટ સોઇલ કન્ડીશનર", hi: "परलाइट मिट्टी कंडीशनर", en: "Horticultural Perlite" },
  "cocopeat": { gu: "હાઇડ્રો-વોશ કોકોપીટ બ્લોક", hi: "कोकोपीट ब्लॉक", en: "Washed Cocopeat Block" },
  "neem cake": { gu: "ઓર્ગેનિક લીમડાનો ખોળ (Neem Cake)", hi: "ऑर्गेनिक नीम खली", en: "Organic Neem Cake Fertilizer" },
  "mustard cake": { gu: "સરસવની ખોળ ખાતર", hi: "सरसों की खली खाद", en: "Mustard Cake Fertilizer" },
  "bone meal": { gu: "સ્ટીમ બોનમીલ ઓર્ગેનિક ખાતર", hi: "स्टीम्ड बोनमील जैविक खाद", en: "Steamed Bone Meal Organic Fertilizer" },
  "watering can": { gu: "વોટરિંગ કેન (સ્પ્રેયર સાથે)", hi: "वाटरिंग कैन (फुहारा)", en: "Ergonomic Watering Can" },
  "spray bottle": { gu: "પ્રેશર સ્પ્રે બોટલ (1L)", hi: "प्रेशर स्प्रे बोतल", en: "Pressure Garden Spray Bottle" },
  "pruner": { gu: "પ્રોફેશનલ પ્રૂનિંગ કાતર", hi: "प्रोफेशनल प्रूनिंग कैंची", en: "Heavy-Duty Pruning Shears" },
  "shears": { gu: "ગાર્ડનિંગ કાતર", hi: "बागवानी कैंची", en: "Garden Pruning Shears" },
  "planter": { gu: "કુંડું / પ્લાન્ટર", hi: "गमला / प्लांटर", en: "Planter Pot" },
  "seeds": { gu: "ઓર્ગેનિક દેશી બીજ", hi: "जैविक देशी बीज", en: "Organic Heirloom Seeds" },
  "seed": { gu: "ઓર્ગેનિક બીજ", hi: "जैविक बीज", en: "Organic Seeds" },

  // User nursery items from admin panel
  "glazed pots": { gu: "ગ્લેઝ્ડ કુંડાં (Glazed Pots)", hi: "ग्लेज़्ड गमले (Glazed Pots)", en: "Glazed Pots" },
  "glazed pot": { gu: "ગ્લેઝ્ડ કુંડું", hi: "ग्लेज़्ड गमला", en: "Glazed Pot" },
  "glazed": { gu: "ગ્લેઝ્ડ કુંડું", hi: "ग्लेज़्ड गमला", en: "Glazed Pot" },
  "erodium": { gu: "ઇરોડિયમ ફૂલોનો છોડ (Erodium)", hi: "इरोडियम का फूल वाला पौधा (Erodium)", en: "Erodium Flowering Plant" },
  "plumeria": { gu: "પ્લુમેરિયા / ચંપો (Plumeria)", hi: "प्लुमेरिया / चंपा का पौधा (Plumeria)", en: "Plumeria (Champa Flower)" },
  "agribloom": { gu: "એગ્રીબ્લૂમ ગાર્ડનિંગ કેર (AgriBloom)", hi: "एग्रीब्लूम गार्डनिंग केयर (AgriBloom)", en: "AgriBloom Plant Care" },
  "gardening tools": { gu: "બગીચાના ઓજારો (Gardening Tools)", hi: "बागवानी उपकरण (Gardening Tools)", en: "Gardening Tools Set" },
  "gardening tool": { gu: "બગીચાનું ઓજાર", hi: "बागवानी उपकरण", en: "Gardening Tool" },
  "jashmin": { gu: "ચમેલી / મોગરો (Jasmine)", hi: "चमेली / मोगरा (Jasmine)", en: "Jasmine Plant (Mogra)" },
  "potting mix": { gu: "ઓર્ગેનિક પોટિંગ સોઇલ મિક્સ", hi: "ऑर्गेनिक पॉटिंग सॉइल मिक्स", en: "Organic Potting Soil Mix" },
  "potting soil": { gu: "ઓર્ગેનિક પોટિંગ સોઇલ મિક્સ", hi: "ऑर्गेनिक पॉटिंग सॉइल मिक्स", en: "Organic Potting Soil Mix" },
  "sunflower": { gu: "સૂર્યમુખીનો છોડ (Sunflower)", hi: "सूरजमुखी का पौधा (Sunflower)", en: "Sunflower Plant" },
  "sun flower": { gu: "સૂર્યમુખીનો છોડ (Sunflower)", hi: "सूरजमुखी का पौधा (Sunflower)", en: "Sunflower Plant" },

  // Devanagari Hindi direct matches
  "गुलाब का पौधा": { gu: "ગુલાબનો છોડ", hi: "गुलाब का पौधा", en: "Rose Plant" },
  "गुलाब": { gu: "ગુલાબનો છોડ", hi: "गुलाब का पौधा", en: "Rose Plant" },
  "धनिया": { gu: "કોથમીર / ધાણાના બીજ (Coriander)", hi: "धनिया के बीज (Coriander)", en: "Coriander Seeds" },
  "टमाटर": { gu: "ટામેટાંના દેશી બીજ / છોડ (Tomato)", hi: "टमाटर के बीज / पौधा (Tomato)", en: "Tomato Seeds & Plant" },
  "सूरजमुखी": { gu: "સૂર્યમુખીનો છોડ (Sunflower)", hi: "सूरजमुखी का पौधा (Sunflower)", en: "Sunflower Plant" },
  "चंपा": { gu: "ચંપો (પ્લુમેરિયા)", hi: "चंपा / प्लुमेरिया का पौधा", en: "Plumeria (Champa)" },
  "चमेली": { gu: "ચમેલી / મોગરો (Jasmine)", hi: "चमेली / मोगरा (Jasmine)", en: "Jasmine (Chameli)" },
  "मोगरा": { gu: "મોગરો (Mogra)", hi: "मोगरा का पौधा", en: "Mogra Plant (Arabian Jasmine)" },
  "तुलसी": { gu: "તુલસીનો છોડ", hi: "तुलसी का पौधा", en: "Tulsi (Holy Basil)" },
  "एलोवेरा": { gu: "એલોવેરા (કુંવારપાઠું)", hi: "एलोवेरा (घृतकुमारी)", en: "Aloe Vera Plant" },
  "पुदीना": { gu: "ફુદીનો (Pudina)", hi: "पुदीना का पौधा", en: "Mint Plant (Pudina)" },
  "बागवानी उपकरण": { gu: "બગીચાના ઓજારો", hi: "बागवानी उपकरण", en: "Gardening Tools" },
  "गमले": { gu: "કુંડાં અને પ્લાન્ટર્સ", hi: "गमले और प्लांटर्स", en: "Pots & Planters" },
  "गमला": { gu: "કુંડું / પ્લાન્ટર", hi: "गमला / प्लांटर", en: "Planter Pot" },
  "खाद": { gu: "ઓર્ગેનિક જૈવિક ખાતર", hi: "जैविक खाद", en: "Organic Fertilizer" },
  "बीज": { gu: "ઓર્ગેનિક બીજ પેક", hi: "जैविक बीज", en: "Organic Seeds" },
  "इरोडियम": { gu: "ઇરોડિયમ ફૂલોનો છોડ (Erodium)", hi: "इरोडियम का फूल वाला पौधा (Erodium)", en: "Erodium Flowering Plant" },
  "प्लुमेरिया": { gu: "પ્લુમેરિયા (ચંપો)", hi: "प्लुमेरिया (चंपा)", en: "Plumeria (Champa)" },
  "एग्रीब्लूम": { gu: "એગ્રીબ્લૂમ ગાર્ડનિંગ કેર", hi: "एग्रीब्लूम गार्डनिंग केयर", en: "AgriBloom Plant Care" },
  "पॉटिंग सॉइल": { gu: "પોટિંગ સોઇલ મિક્સ", hi: "पॉटिंग सॉइल मिक्स", en: "Potting Soil Mix" },

  // Gujarati direct matches
  "ગુલાબનો છોડ": { gu: "ગુલાબનો છોડ", hi: "गुलाब का पौधा", en: "Rose Plant" },
  "ગુલાબ": { gu: "ગુલાબનો છોડ", hi: "गुलाब का पौधा", en: "Rose Plant" },
  "કોથમીર": { gu: "કોથમીર / ધાણાના બીજ (Coriander)", hi: "धनिया के बीज (Coriander)", en: "Coriander Seeds" },
  "ધાણા": { gu: "કોથમીર / ધાણાના બીજ (Coriander)", hi: "धनिया के बीज (Coriander)", en: "Coriander Seeds" },
  "ટામેટાં": { gu: "ટામેટાંના બીજ / છોડ (Tomato)", hi: "टमाटर के बीज / पौधा (Tomato)", en: "Tomato Seeds & Plant" },
  "ટામેટા": { gu: "ટામેટાંના બીજ / છોડ (Tomato)", hi: "टमाटर के बीज / पौधा (Tomato)", en: "Tomato Seeds & Plant" },
  "સૂર્યમુખી": { gu: "સૂર્યમુખીનો છોડ (Sunflower)", hi: "सूरजमुखी का पौधा (Sunflower)", en: "Sunflower Plant" },
  "ચંપો": { gu: "ચંપો (પ્લુમેરિયા)", hi: "चंपा / प्लुमेरिया का पौधा", en: "Plumeria (Champa)" },
  "મોગરો": { gu: "મોગરો (Mogra)", hi: "मोगरा का पौधा", en: "Mogra Plant (Arabian Jasmine)" },
  "તુલસીનો છોડ": { gu: "તુલસીનો છોડ", hi: "तुलसी का पौधा", en: "Tulsi (Holy Basil)" },
  "કુંડાં": { gu: "કુંડાં અને પ્લાન્ટર્સ", hi: "गमले और प्लांटर्स", en: "Pots & Planters" },
  "કુંડું": { gu: "કુંડું / પ્લાન્ટર", hi: "गमला / प्लांटर", en: "Planter Pot" },
  "ઓજારો": { gu: "બગીચાના ઓજારો", hi: "बागवानी उपकरण", en: "Gardening Tools" },
  "ઇરોડિયમ": { gu: "ઇરોડિયમ ફૂલોનો છોડ", hi: "इरोडियम का फूल वाला पौधा", en: "Erodium Flowering Plant" },
  "એગ્રીબ્લૂમ": { gu: "એગ્રીબ્લૂમ ગાર્ડનિંગ કેર", hi: "एग्रीब्लूम गार्डनिंग केयर", en: "AgriBloom Plant Care" },
  "પોટિંગ સોઇલ": { gu: "પોટિંગ સોઇલ મિક્સ", hi: "पॉटिंग सॉइल मिक्स", en: "Potting Soil Mix" },
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
  "glazed pots": {
    gu: "આકર્ષક અને સુંદર ગ્લેઝ્ડ સિરામિક કુંડાં જે ઇન્ડોર અને બાલ્કની ડેકોરેશન માટે શ્રેષ્ઠ છે.",
    hi: "सुंदर और सुरुचिपूर्ण चमकदार गमले जो इनडोर और बालकनी की सुंदरता बढ़ाते हैं।",
    en: "Beautiful glazed pots with an elegant finish, perfect for decoration.",
  },
  "glazed pot": {
    gu: "આકર્ષક અને સુંદર ગ્લેઝ્ડ સિરામિક કુંડું જે ઇન્ડોર અને બાલ્કની ડેકોરેશન માટે શ્રેષ્ઠ છે.",
    hi: "सुंदर और सुरुचिपूर्ण चमकदार गमला जो इनडोर और बालकनी की सुंदरता बढ़ाता है।",
    en: "Beautiful glazed pots with an elegant finish, perfect for decoration.",
  },
  "erodium": {
    gu: "નાજુક અને સુંદર ફૂલોવાળો છોડ જે રોક ગાર્ડન અને કુંડાં માટે આદર્શ છે.",
    hi: "नाजुक फूलों वाला मनमोहक पौधा जो गमलों और गार्डन के लिए बहुत सुंदर है।",
    en: "Erodium is a charming flowering plant with delicate blooms.",
  },
  "plumeria": {
    gu: "સુગંધિત અને ઉષ્ણકટિબંધીય સુંદર ફૂલોવાળો ચંપાનો છોડ.",
    hi: "सुगंधित और सुंदर फूलों वाला चंपा का उष्णकटिबंधीय पौधा।",
    en: "Plumeria is a beautiful tropical flowering plant known for its fragrant blooms.",
  },
  "agribloom": {
    gu: "છોડના તંદુરસ્ત વિકાસ, પોષણ અને સુરક્ષા માટે ઓર્ગેનિક બૂસ્ટર.",
    hi: "पौधों के स्वस्थ विकास, पोषण और सुरक्षा के लिए बागवानी उत्पाद।",
    en: "Agribloom is a gardening product designed to support plant growth.",
  },
  "gardening tools": {
    gu: "બગીચાની માટી ગોડવા અને છોડ વાવવા માટે મજબૂત ઓજારોનો સેટ.",
    hi: "बागवानी के काम को आसान बनाने के लिए उपयोगी उपकरणों का सेट।",
    en: "Make gardening easier with our practical gardening tools.",
  },
  "jashmin": {
    gu: "મધુર સુગંધ આપતો મોગરા / ચમેલીનો સુંદર છોડ.",
    hi: "मीठी सुगंध देने वाला चमेली / मोगरा का लोकप्रिय फूल वाला पौधा।",
    en: "Jasmine is a lovely flowering plant known for its delicate blooms.",
  },
  "coriander": {
    gu: "ઘરે તાજી કોથમીર ઉગાડવા માટે ઓર્ગેનિક દેશી બીજ.",
    hi: "घर पर ताज़ा धनिया उगाने के लिए उत्तम गुणवत्ता वाले बीज।",
    en: "Grow fresh coriander at home with these coriander seeds.",
  },
  "धनिया": {
    gu: "ઘરે તાજી કોથમીર ઉગાડવા માટે ઓર્ગેનિક દેશી બીજ.",
    hi: "घर पर ताज़ा धनिया उगाने के लिए उत्तम गुणवत्ता वाले बीज।",
    en: "Grow fresh coriander at home with these coriander seeds.",
  },
  "tomato": {
    gu: "ઘરઆંગણે ભરપૂર ટામેટાં મેળવવા માટે ઉત્તમ હાઇબ્રિડ/દેશી બીજ.",
    hi: "अपने बगीचे में ताज़े टमाटर उगाने के लिए टमाटर के बीज।",
    en: "Grow your own fresh tomatoes with tomato seeds.",
  },
  "टमाटर": {
    gu: "ઘરઆંગણે ભરપૂર ટામેટાં મેળવવા માટે ઉત્તમ હાઇબ્રિડ/દેશી બીજ.",
    hi: "अपने बगीचे में ताज़े टमाटर उगाने के लिए टमाटर के बीज।",
    en: "Grow your own fresh tomatoes with tomato seeds.",
  },
  "potting mix": {
    gu: "છોડના ઝડપી મૂળ વિકાસ માટે વર્મીકમ્પોસ્ટ અને કોકોપીટ યુક્ત પોટિંગ સોઇલ.",
    hi: "पौधों के बेहतर विकास के लिए पोषक तत्वों से भरपूर पॉटिंग सॉइल मिक्स।",
    en: "Give your plants a suitable growing medium with our potting mix.",
  },
  "sunflower": {
    gu: "ચમકદાર પીળા સૂર્યમુખીના ફૂલો જે બગીચામાં ખુશી અને રોનક લાવે છે.",
    hi: "अपने बगीचे को खूबसूरत पीले सूरजमुखी के फूलों से रोशन करें।",
    en: "Brighten your garden with beautiful sunflowers.",
  },
  "गुलाब": {
    gu: "બગીચાની સુંદરતા વધારતો સુગંધિત લાલ ગુલાબનો છોડ.",
    hi: "अपने बगीचे में सुंदरता और सुगंध लाने के लिए खूबसूरत गुलाब का पौधा।",
    en: "Bring beauty and elegance to your garden with our rose plant.",
  },
};

export function formatNameByLanguage(rawItemOrName, language = "en") {
  if (!rawItemOrName) return "";

  let itemStr = "";
  if (typeof rawItemOrName === "object" && rawItemOrName !== null) {
    if (language === "gu" && rawItemOrName.name_gu && String(rawItemOrName.name_gu).trim()) {
      return formatNameByLanguage(rawItemOrName.name_gu, "gu");
    }
    if (language === "hi" && rawItemOrName.name_hi && String(rawItemOrName.name_hi).trim()) {
      return formatNameByLanguage(rawItemOrName.name_hi, "hi");
    }
    if (language === "en" && rawItemOrName.name_en && String(rawItemOrName.name_en).trim()) {
      const enVal = String(rawItemOrName.name_en).trim();
      if (!/[\u0900-\u097F\u0A80-\u0AFF]/.test(enVal)) {
        return enVal;
      }
    }
    itemStr = String(rawItemOrName.name || rawItemOrName.name_en || rawItemOrName.name_hi || rawItemOrName.name_gu || "").trim();
  } else {
    itemStr = String(rawItemOrName).trim();
  }

  if (!itemStr) return "";

  const trimmed = itemStr;
  const lower = trimmed.toLowerCase();

  // 1. Direct dictionary match
  for (const [key, map] of Object.entries(NAME_DICTIONARY)) {
    const k = key.toLowerCase();
    if (lower === k || lower.includes(k) || k.includes(lower)) {
      return map[language] || map["en"] || trimmed;
    }
  }

  // 2. Normalize and Stem match (e.g. "gardening" -> "garden", "jashmin" -> "jasmine", "pots" -> "pot")
  const normalized = lower
    .replace(/\bgardening\b/g, "garden")
    .replace(/\bjashmin\b/g, "jasmine")
    .replace(/\bjasmin\b/g, "jasmine")
    .replace(/\bpots\b/g, "pot")
    .replace(/\btools\b/g, "tool")
    .replace(/\bseeds\b/g, "seed")
    .replace(/\bplants\b/g, "plant");

  if (normalized !== lower) {
    for (const [key, map] of Object.entries(NAME_DICTIONARY)) {
      const k = key.toLowerCase();
      if (normalized === k || normalized.includes(k) || k.includes(normalized)) {
        return map[language] || map["en"] || trimmed;
      }
    }
  }

  // 3. Word token matching for compound phrases
  const words = lower.split(/[\s,+/&_-]+/).filter(Boolean);
  if (words.length > 1) {
    for (const [key, map] of Object.entries(NAME_DICTIONARY)) {
      const k = key.toLowerCase();
      if (words.some((w) => w.length > 3 && (k === w || k.includes(w)))) {
        return map[language] || map["en"] || trimmed;
      }
    }
  }

  // 4. Parse parenthetical strings like "Gujarati Text (English Text)"
  const match = trimmed.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    const guText = match[1].trim();
    const enText = match[2].trim();

    if (language === "en") {
      return enText.charAt(0).toUpperCase() + enText.slice(1);
    }
    for (const [key, map] of Object.entries(NAME_DICTIONARY)) {
      const k = key.toLowerCase();
      if (enText.toLowerCase().includes(k) || guText.toLowerCase().includes(k)) {
        return map[language] || (language === "hi" ? map["hi"] || guText : guText);
      }
    }
    return guText;
  }

  return trimmed;
}

export function getTranslationsForName(inputName) {
  if (!inputName || !String(inputName).trim()) {
    return { en: "", gu: "", hi: "" };
  }
  const clean = String(inputName).trim();
  const lower = clean.toLowerCase();

  for (const [key, map] of Object.entries(NAME_DICTIONARY)) {
    const k = key.toLowerCase();
    if (lower.includes(k) || k.includes(lower)) {
      return {
        en: map.en || clean,
        gu: map.gu || clean,
        hi: map.hi || clean,
      };
    }
  }

  const match = clean.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    const first = match[1].trim();
    const second = match[2].trim();
    return {
      en: second,
      gu: first,
      hi: first,
    };
  }

  return { en: clean, gu: clean, hi: clean };
}

export function formatDescriptionByLanguage(rawDescOrItem, language = "en", rawName = "") {
  if (!rawDescOrItem) return "";
  if (typeof rawDescOrItem === "object" && rawDescOrItem !== null) {
    if (language === "gu" && rawDescOrItem.description_gu && String(rawDescOrItem.description_gu).trim()) {
      return String(rawDescOrItem.description_gu).trim();
    }
    if (language === "hi" && rawDescOrItem.description_hi && String(rawDescOrItem.description_hi).trim()) {
      return String(rawDescOrItem.description_hi).trim();
    }
    if (language === "en" && rawDescOrItem.description_en && String(rawDescOrItem.description_en).trim()) {
      return String(rawDescOrItem.description_en).trim();
    }
    return formatDescriptionByLanguage(rawDescOrItem.description || "", language, rawDescOrItem.name || "");
  }

  if (language === "en") return rawDescOrItem || "";

  const searchKey = `${rawName || ""} ${rawDescOrItem || ""}`.toLowerCase();
  for (const [key, map] of Object.entries(DESCRIPTION_DICTIONARY)) {
    if (searchKey.includes(key)) {
      return map[language] || rawDescOrItem || "";
    }
  }

  return rawDescOrItem || "";
}

export function formatWeatherCondition(condition, language = "en") {
  if (!condition) return "";
  const map = {
    "hot & dry": { gu: "ગરમ અને સૂકું હવામાન", hi: "गर्म और शुष्क", en: "Hot & Dry" },
    "sunny / pleasant": { gu: "તડકો / અનુકૂળ હવામાન", hi: "धूप / सुखद मौसम", en: "Sunny / Pleasant" },
    "sunny": { gu: "તડકો", hi: "धूप", en: "Sunny" },
    "pleasant": { gu: "અનુકૂળ હવામાન", hi: "सुखद मौसम", en: "Pleasant" },
    "rainy / damp": { gu: "વરસાદી / ભેજવાળું", hi: "बारिश / नम", en: "Rainy / Damp" },
    "rainy": { gu: "વરસાદી", hi: "बारिश", en: "Rainy" },
    "cool / dormant": { gu: "ઠંડું હવામાન", hi: "ठंडा मौसम", en: "Cool / Dormant" },
    "cool": { gu: "ઠંડું", hi: "ठंडा", en: "Cool" },
    "clear sky": { gu: "સ્વચ્છ આકાશ", hi: "साफ आसमान", en: "Clear Sky" },
    "partly cloudy": { gu: "અંશતઃ વાદળછાયું", hi: "आंशिक रूप से बादल", en: "Partly Cloudy" },
    "overcast": { gu: "વાદળછાયું", hi: "बादल छाए हुए", en: "Overcast" },
    "foggy": { gu: "ધુમ્મસિયું", hi: "कोहरा", en: "Foggy" },
  };
  const lower = String(condition).toLowerCase().trim();
  for (const [k, v] of Object.entries(map)) {
    if (lower.includes(k) || k.includes(lower)) {
      return v[language] || v["en"] || condition;
    }
  }
  return condition;
}

export function formatWeatherTip(tip, language = "en") {
  if (!tip) return "";
  if (language === "en") return tip;

  const tipMap = [
    {
      match: "high heat alert",
      gu: "તીવ્ર ગરમીની ચેતવણી (>32°C). ગરમીથી છોડને બચાવવા માટે વહેલી સવારે અથવા સાંજે ઊંડાણપૂર્વક પાણી આપો.",
      hi: "अत्यधिक गर्मी का अलर्ट (>32°C)। गर्मी से तनाव कम करने के लिए सुबह जल्दी या शाम को गहराई से पानी दें।",
    },
    {
      match: "rain detected",
      gu: "વરસાદ પડી રહ્યો છે. મૂળ સડવાથી બચાવવા માટે આજે આઉટડોર અને બાલ્કનીના છોડને પાણી આપવાનું ટાળો.",
      hi: "बारिश दर्ज की गई। जड़ों को सड़ने से बचाने के लिए आज बाहरी और बालकनी के पौधों को पानी न दें।",
    },
    {
      match: "cooler temperatures",
      gu: "ઠંડું તાપમાન બાષ્પીભવન ધીમું કરે છે. પાણી આપવાની આવર્તન ઓછી કરો.",
      hi: "कम तापमान से पानी का वाष्पीकरण धीमा होता है। पानी देने की आवृत्ति कम करें।",
    },
    {
      match: "standard watering routine",
      gu: "શહેરી બાલ્કનીના છોડ માટે સામાન્ય વોટરિંગ રૂટીન અનુકૂળ છે.",
      hi: "अधिकांश शहरी बालकनी पौधों के लिए सामान्य पानी की दिनचर्या उपयुक्त है।",
    },
    {
      match: "high humidity warning",
      gu: "વધુ ભેજની ચેતવણી: ફૂગ ઝડપથી ફેલાઈ શકે છે. પાંદડા પર ઉપરથી પાણી છાંટવાનું ટાળો.",
      hi: "उच्च आर्द्रता चेतावनी: फफूंद तेजी से फैल सकती है। पत्तियों के ऊपर से पानी डालने से बचें।",
    },
  ];

  const lower = tip.toLowerCase();
  for (const item of tipMap) {
    if (lower.includes(item.match)) {
      return item[language] || tip;
    }
  }
  return tip;
}