// js/citizen/location_data.js - Geospatial Entities, Translation Gazetteers & Distance Helpers
(function() {
const SIMULATED_REGIONS = [
  { label: "District Central (HQ)", lang: "or", lat: 22.1245, lng: 84.0321, name: "District Central, HQ" },
  { label: "Varanasi (Bhojpuri / UP)", lang: "bho", lat: 25.3176, lng: 82.9739, name: "Varanasi, UP" },
  { label: "Kolkata (West Bengal)", lang: "bn", lat: 22.5726, lng: 88.3639, name: "Kolkata, West Bengal" },
  { label: "New Delhi (National Grid)", lang: "hi", lat: 28.6139, lng: 77.2090, name: "New Delhi (National Grid)" },
  { label: "Chennai (Tamil Nadu)", lang: "ta", lat: 13.0827, lng: 80.2707, name: "Chennai, Tamil Nadu" },
  { label: "Bengaluru (Karnataka)", lang: "kn", lat: 12.9716, lng: 77.5946, name: "Bengaluru, Karnataka" },
  { label: "Hyderabad (Telangana)", lang: "te", lat: 17.3850, lng: 78.4867, name: "Hyderabad, Telangana" },
  { label: "Mumbai (Maharashtra)", lang: "mr", lat: 19.0760, lng: 72.8777, name: "Mumbai, Maharashtra" }
];

const CIVIC_BACKGROUNDS = ['assets/bg_1_smart_village.jpg', 'assets/bg_2_smart_odisha.jpg', 'assets/bg_3_smart_bengal.jpg'];
const INITIAL_NOTIFICATIONS = [];

// Intelligent Automatic Title Synthesizer for Submitted Problems
function generateAutoProblemTitle(text, category, voiceMeta) {
  const t = (text || "").trim();
  if (voiceMeta && voiceMeta.aiAnalyzedTitle && voiceMeta.aiAnalyzedTitle !== text) {
    return voiceMeta.aiAnalyzedTitle;
  }
  const lower = t.toLowerCase();

  // Power & Electricity
  if (lower.includes('electric') || lower.includes('pole') || lower.includes('wire') || lower.includes('power') || lower.includes('current') || lower.includes('transformer') || lower.includes('बिजली') || lower.includes('खंभा') || lower.includes('विद्युत') || lower.includes('ବିଜୁଳି') || lower.includes('जर गइल') || lower.includes('बिजुलिया') || lower.includes('लाइन नइखे')) {
    if (lower.includes('fall') || lower.includes('fell') || lower.includes('broken') || lower.includes('गिर') || lower.includes('टूट') || lower.includes('ଭାଙ୍ଗି')) {
      return "Electricity Pole Collapse & 33kV Power Hazard";
    }
    if (lower.includes('transformer') || lower.includes('blast') || lower.includes('जल गया') || lower.includes('जर गइल')) {
      return "Distribution Transformer Failure & Blackout";
    }
    return "Village Electricity Outage & Grid Failure";
  }

  // Roads & Bridges
  if (lower.includes('bridge') || lower.includes('pul') || lower.includes('pulia') || lower.includes('पुल') || lower.includes('पुलिया') || lower.includes('पुलवा') || lower.includes('ପୋଲ')) {
    if (lower.includes('collapse') || lower.includes('wash') || lower.includes('flood') || lower.includes('बह') || lower.includes('टूट') || lower.includes('गइल')) {
      return "Critical Bridge Washout & Transportation Disruption";
    }
    return "Bridge Structural Damage & Access Hazard";
  }
  if (lower.includes('road') || lower.includes('rasta') || lower.includes('highway') || lower.includes('सड़क') || lower.includes('रास्ता') || lower.includes('सड़किया') || lower.includes('ରାସ୍ତା')) {
    if (lower.includes('flood') || lower.includes('mud') || lower.includes('water') || lower.includes('पानी') || lower.includes('बाढ़') || lower.includes('भरल')) {
      return "Severe Monsoon Road Inundation & Village Cut-Off";
    }
    if (lower.includes('pothole') || lower.includes('gaddha') || lower.includes('गड्ढा') || lower.includes('गड़हा') || lower.includes('ଖାଲ')) {
      return "Severe Pothole Damage & Hazardous Roadway";
    }
    return "Damaged Roadway Requiring PMGSY Re-Surfacing";
  }

  // Drinking Water & RWSS
  if (lower.includes('water') || lower.includes('pani') || lower.includes('handpump') || lower.includes('tap') || lower.includes('borewell') || lower.includes('fluoride') || lower.includes('drinking') || lower.includes('pipe') || lower.includes('पानी') || lower.includes('पनिया') || lower.includes('चापाकल') || lower.includes('चापकाल') || lower.includes('ପାଣି')) {
    if (lower.includes('broken') || lower.includes('leak') || lower.includes('damage') || lower.includes('नल') || lower.includes('टूट') || lower.includes('खराब') || lower.includes('बिगड़ल')) {
      return "Drinking Water Pipeline & Community Tap Breakdown";
    }
    if (lower.includes('dry') || lower.includes('shortage') || lower.includes('scarcity') || lower.includes('सूख') || lower.includes('नइखे')) {
      return "Acute Drinking Water Crisis & Borewell Depletion";
    }
    if (lower.includes('fluoride') || lower.includes('yellow') || lower.includes('ganda') || lower.includes('गंदा')) {
      return "Severe Drinking Water Contamination Hazard";
    }
    return "Jal Jeevan Drinking Water Infrastructure Grievance";
  }

  // Healthcare
  if (lower.includes('hospital') || lower.includes('doctor') || lower.includes('phc') || lower.includes('medicine') || lower.includes('clinic') || lower.includes('health') || lower.includes('nurse') || lower.includes('ambulance') || lower.includes('अस्पताल') || lower.includes('डाक्टर') || lower.includes('ଡାକ୍ତର')) {
    if (lower.includes('absent') || lower.includes('nahi') || lower.includes('नहीं') || lower.includes('नइखन')) {
      return "Primary Health Center Doctor Absenteeism & Service Failure";
    }
    if (lower.includes('ambulance') || lower.includes('गाड़ी') || lower.includes('एंबुलेंस')) {
      return "Emergency 108 Ambulance Delay & Critical Access Barrier";
    }
    return "Emergency Medical Facility & Pharmacy Access Issue";
  }

  // Education / School
  if (lower.includes('school') || lower.includes('roof') || lower.includes('classroom') || lower.includes('student') || lower.includes('teacher') || lower.includes('स्कूल') || lower.includes('स्कूलवा') || lower.includes('छत') || lower.includes('ବିଦ୍ୟାଳୟ')) {
    if (lower.includes('roof') || lower.includes('leak') || lower.includes('collapse') || lower.includes('छत') || lower.includes('चुअता') || lower.includes('टपक')) {
      return "Government School Classroom Roof Leakage & Safety Hazard";
    }
    return "School Academic Facility & Classroom Grievance";
  }

  // Drainage & Floods
  if (lower.includes('drain') || lower.includes('sewage') || lower.includes('overflow') || lower.includes('flood') || lower.includes('waterlog') || lower.includes('नाली') || lower.includes('नाला') || lower.includes('जलजमाव')) {
    return "Monsoon Drainage Channel Overflow & Village Waterlogging";
  }

  // Canal & Irrigation
  if (lower.includes('canal') || lower.includes('irrigation') || lower.includes('farmer') || lower.includes('crop') || lower.includes('नहर') || lower.includes('सिंचाई') || lower.includes('पटवन') || lower.includes('କେନାଲ')) {
    return "Canal Water Supply Breach & Agricultural Irrigation Disruption";
  }
  if (t) {
    const cleanT = t.replace(/^["']|["']$/g, '').trim();
    const words = cleanT.split(/\s+/);
    if (words.length <= 7) {
      return cleanT.charAt(0).toUpperCase() + cleanT.slice(1);
    }
    return words.slice(0, 7).join(" ").replace(/[,.;:]$/, "") + "...";
  }
  return category && category !== 'General' ? `${category} Infrastructure Grievance` : "Public Infrastructure Grievance";
}

// Haversine GPS Distance Helper Calculation (KM)
  const parseGpsCoords = gpsStr => {
    if (!gpsStr) return {
      lat: 22.1245,
      lng: 84.0321
    };
    if (typeof gpsStr === 'object' && gpsStr.lat && gpsStr.lng) return gpsStr;
    const matches = String(gpsStr).match(/([\d.]+)[^\d,]*([NSns])?[^\d]+([\d.]+)[^\d,]*([EWew])?/);
    if (matches) {
      let lat = parseFloat(matches[1]);
      if (matches[2] && matches[2].toUpperCase() === 'S') lat = -lat;
      let lng = parseFloat(matches[3]);
      if (matches[4] && matches[4].toUpperCase() === 'W') lng = -lng;
      if (!isNaN(lat) && !isNaN(lng)) return {
        lat,
        lng
      };
    }
    return {
      lat: 22.1245,
      lng: 84.0321
    };
  };
  const getDistanceKm = (loc1, loc2) => {
    if (!loc1 || !loc2) return 0.5;
    const R = 6371;
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  };

// Comprehensive Bidirectional Multi-Dialect Regional Address & Location Translator (ODIA, HINDI, BHOJPURI, BENGALI, ENGLISH)
  const LOCATION_TRANSLATION_ENTITIES = [
  // Odisha Districts & Major Towns
  {
    en: "Janla",
    or: "ଜାନଳା",
    hi: "जानला",
    bn: "জানলা",
    bho: "जानला"
  }, {
    en: "Khordha",
    or: "ଖୋର୍ଦ୍ଧା",
    hi: "खोरधा",
    bn: "খোরধা",
    bho: "खोरधा"
  }, {
    en: "Khurda",
    or: "ଖୋର୍ଦ୍ଧା",
    hi: "खोरधा",
    bn: "খোরধা",
    bho: "खोरधा"
  }, {
    en: "Bhubaneswar",
    or: "ଭୁବନେଶ୍ୱର",
    hi: "भुवनेश्वर",
    bn: "ভুবনেশ্বর",
    bho: "भुवनेश्वर"
  }, {
    en: "Cuttack",
    or: "କଟକ",
    hi: "कटक",
    bn: "কটক",
    bho: "कटक"
  },   {
    en: "Sambalpur",
    or: "ସମ୍ବଲପୁର",
    hi: "संबलपुर",
    bn: "সম্বলপুর",
    bho: "संबलपुर"
  }, {
    en: "Rourkela",
    or: "ରାଉରକେଲା",
    hi: "राउरकेला",
    bn: "রাউরকেল্লা",
    bho: "राउरकेला"
  }, {
    en: "Puri",
    or: "ପୁରୀ",
    hi: "पुरी",
    bn: "পুরী",
    bho: "पुरी"
  }, {
    en: "Balasore",
    or: "ବାଲେଶ୍ୱର",
    hi: "बालेश्वर",
    bn: "বালেশ্বর",
    bho: "बालेश्वर"
  }, {
    en: "Baleswar",
    or: "ବାଲେଶ୍ୱର",
    hi: "बालेश्वर",
    bn: "বালেশ্বর",
    bho: "बालेश्वर"
  }, {
    en: "Berhampur",
    or: "ବ୍ରହ୍ମପୁର",
    hi: "ब्रह्मपुर",
    bn: "ব্রহ্মপুর",
    bho: "ब्रह्मपुर"
  }, {
    en: "Brahmapur",
    or: "ବ୍ରହ୍ମପୁର",
    hi: "ब्रह्मपुर",
    bn: "ব্রহ্মপুর",
    bho: "ब्रह्मपुर"
  }, {
    en: "Lathikata",
    or: "ଲାଠିକଟା",
    hi: "लाठीकाटा",
    bn: "লাঠিকাটা",
    bho: "लाठीकाटा"
  }, {
    en: "Angul",
    or: "ଅନୁଗୋଳ",
    hi: "अनुगुल",
    bn: "অনুগুল",
    bho: "अनुगुल"
  }, {
    en: "Anugul",
    or: "ଅନୁଗୋଳ",
    hi: "अनुगुल",
    bn: "অনুগুল",
    bho: "अनुगुल"
  }, {
    en: "Balangir",
    or: "ବଲାଙ୍ଗୀର",
    hi: "बलांगीर",
    bn: "বলাঙ্গীর",
    bho: "बलांगीर"
  }, {
    en: "Bolangir",
    or: "ବଲାଙ୍ଗୀର",
    hi: "बलांगीर",
    bn: "বলাঙ্গীর",
    bho: "बलांगीर"
  }, {
    en: "Bargarh",
    or: "ବରଗଡ଼",
    hi: "बरगढ़",
    bn: "বরগড়",
    bho: "बरगढ़"
  }, {
    en: "Bhadrak",
    or: "ଭଦ୍ରକ",
    hi: "भद्रक",
    bn: "ভদ্রक",
    bho: "भद्रक"
  }, {
    en: "Boudh",
    or: "ବୌଦ୍ଧ",
    hi: "बौध",
    bn: "বৌধ",
    bho: "बौध"
  }, {
    en: "Bauda",
    or: "ବୌଦ୍ଧ",
    hi: "बौध",
    bn: "বৌধ",
    bho: "बौध"
  }, {
    en: "Deogarh",
    or: "ଦେବଗଡ଼",
    hi: "देवगढ़",
    bn: "দেবগড়",
    bho: "देवगढ़"
  }, {
    en: "Debagarh",
    or: "ଦେବଗଡ଼",
    hi: "देवगढ़",
    bn: "দেবগড়",
    bho: "देवगढ़"
  }, {
    en: "Dhenkanal",
    or: "ଢେଙ୍କାନାଳ",
    hi: "ढेंकानाल",
    bn: "ঢেঙ্কানাল",
    bho: "ढेंकानाल"
  }, {
    en: "Gajapati",
    or: "ଗଜପତି",
    hi: "गजपति",
    bn: "গজপতি",
    bho: "गजपति"
  }, {
    en: "Ganjam",
    or: "ଗଞ୍ଜାମ",
    hi: "गंजम",
    bn: "গঞ্জাম",
    bho: "गंजम"
  }, {
    en: "Jagatsinghpur",
    or: "ଜଗତସିଂହପୁର",
    hi: "जगतसिंहपुर",
    bn: "জগৎসিংহপুর",
    bho: "जगतसिंहपुर"
  }, {
    en: "Jajpur",
    or: "ଯାଜପୁର",
    hi: "जाजपुर",
    bn: "যাজপুর",
    bho: "जाजपुर"
  }, {
    en: "Jharsuguda",
    or: "ଝାରସୁଗୁଡ଼ା",
    hi: "झारसुगुड़ा",
    bn: "ঝারসুগুড়া",
    bho: "झारसुगुड़ा"
  }, {
    en: "Kalahandi",
    or: "କଳାହାଣ୍ଡି",
    hi: "कालाहांडी",
    bn: "কালাহান্ডি",
    bho: "कालाहांडी"
  }, {
    en: "Kandhamal",
    or: "କନ୍ଧମାଳ",
    hi: "कंधमाल",
    bn: "কান্ধমাল",
    bho: "कंधमाल"
  }, {
    en: "Kendrapara",
    or: "କେନ୍ଦ୍ରାପଡ଼ା",
    hi: "केंद्रपाड़ा",
    bn: "কেন্দ্রাপাড়া",
    bho: "केंद्रपाड़ा"
  }, {
    en: "Kendujhar",
    or: "କେନ୍ଦୁଝର",
    hi: "केन्दुझर",
    bn: "কেঁন্দুঝর",
    bho: "केन्दुझर"
  }, {
    en: "Keonjhar",
    or: "କେନ୍ଦୁଝର",
    hi: "केन्दुझर",
    bn: "কেঁন্দুঝর",
    bho: "केन्दुझर"
  }, {
    en: "Koraput",
    or: "କୋରାପୁଟ",
    hi: "कोरापुट",
    bn: "কোরাপুট",
    bho: "कोरापुट"
  }, {
    en: "Malkangiri",
    or: "ମାଲକାନଗିରି",
    hi: "मलकानगिरि",
    bn: "মালকানগিরি",
    bho: "मलकानगिरि"
  }, {
    en: "Mayurbhanj",
    or: "ମୟୂରଭଞ୍ଜ",
    hi: "मयूरभंज",
    bn: "ময়ূরভঞ্জ",
    bho: "मयूरभंज"
  }, {
    en: "Nabarangpur",
    or: "ନବରଙ୍ଗପୁର",
    hi: "नबरंगपुर",
    bn: "নবরংপুর",
    bho: "नबरंगपुर"
  }, {
    en: "Nowrangpur",
    or: "ନବରଙ୍ଗପୁର",
    hi: "नबरंगपुर",
    bn: "নবরংপুর",
    bho: "नबरंगपुर"
  }, {
    en: "Nayagarh",
    or: "ନୟାଗଡ଼",
    hi: "नयागढ़",
    bn: "নয়াগড়",
    bho: "नयागढ़"
  }, {
    en: "Nuapada",
    or: "ନୂଆପଡ଼ା",
    hi: "नुआपड़ा",
    bn: "নুয়াপাড়া",
    bho: "नुआपड़ा"
  }, {
    en: "Rayagada",
    or: "ରାୟଗଡ଼ା",
    hi: "रायगड़ा",
    bn: "রায়গড়া",
    bho: "रायगड़ा"
  }, {
    en: "Subarnapur",
    or: "ସୁବର୍ଣ୍ଣପୁର",
    hi: "सुवर्णपुर",
    bn: "সুবর্ণপুর",
    bho: "सुवर्णपुर"
  }, {
    en: "Sonepur",
    or: "ସୁବର୍ଣ୍ଣପୁର",
    hi: "सुवर्णपुर",
    bn: "সুবর্ণপুর",
    bho: "सुवर्णपुर"
  }, {
    en: "Jatni",
    or: "ଜଟଣୀ",
    hi: "जटनी",
    bn: "জটনী",
    bho: "जटनी"
  }, {
    en: "Jatani",
    or: "ଜଟଣୀ",
    hi: "जटनी",
    bn: "ଜଟଣୀ",
    bho: "जटनी"
  }, {
    en: "Baripada",
    or: "ବାରିପଦା",
    hi: "बारीपदा",
    bn: "বারিপদা",
    bho: "बारीपदा"
  }, {
    en: "Bhawanipatna",
    or: "ଭବାନୀପାଟଣା",
    hi: "भवानीपटना",
    bn: "ভবানীপাটনা",
    bho: "भवानीपटना"
  }, {
    en: "Phulbani",
    or: "ଫୁଲବାଣୀ",
    hi: "फुलबानी",
    bn: "ফুলবাণী",
    bho: "फुलबानी"
  }, {
    en: "Paralakhemundi",
    or: "ପାରଳାଖେମୁଣ୍ଡି",
    hi: "पारलाखेमुंडी",
    bn: "পারলাখেমুন্ডি",
    bho: "पारलाखेमुंडी"
  }, {
    en: "Pipili",
    or: "ପିପିଲି",
    hi: "पिपिली",
    bn: "পিপিলি",
    bho: "पिपिली"
  }, {
    en: "Konark",
    or: "କୋଣାର୍କ",
    hi: "कोणार्क",
    bn: "কোণার্ক",
    bho: "कोणार्क"
  }, {
    en: "Paradip",
    or: "ପାରାଦ୍ୱୀପ",
    hi: "पारादीप",
    bn: "পারাদ্বীপ",
    bho: "पारादीप"
  }, {
    en: "Talcher",
    or: "ତାଳଚେର",
    hi: "तालचेर",
    bn: "তালচের",
    bho: "तालचेर"
  }, {
    en: "Jeypore",
    or: "ଜୟପୁର",
    hi: "जयपुर",
    bn: "জয়পুর",
    bho: "जयपुर"
  }, {
    en: "Khandagiri",
    or: "ଖଣ୍ଡଗିରି",
    hi: "खंडगिरि",
    bn: "খণ্ডগিরি",
    bho: "खंडगिरि"
  }, {
    en: "Ghatikia",
    or: "ଘାଟିକିଆ",
    hi: "घाटिकिया",
    bn: "ঘাটিকিয়া",
    bho: "घाटिकिया"
  }, {
    en: "Baramunda",
    or: "ବରମୁଣ୍ଡା",
    hi: "बरमुंडा",
    bn: "বরমুন্ডা",
    bho: "बरमुंडा"
  }, {
    en: "Patia",
    or: "ପଟିଆ",
    hi: "पटिया",
    bn: "পটিয়া",
    bho: "पटिया"
  }, {
    en: "Chandrasekharpur",
    or: "ଚନ୍ଦ୍ରଶେଖରପୁର",
    hi: "चंद्रशेखरपुर",
    bn: "চন্দ্রশেখরপুর",
    bho: "चंद्रशेखरपुर"
  }, {
    en: "Rasulgarh",
    or: "ରସୁଲଗଡ଼",
    hi: "रसूलगढ़",
    bn: "রসূলগড়",
    bho: "रसूलगढ़"
  }, {
    en: "Saheed Nagar",
    or: "ସହୀଦ ନଗର",
    hi: "शहीद नगर",
    bn: "শহীদ নগর",
    bho: "शहीद नगर"
  }, {
    en: "Nayapalli",
    or: "ନୟାପଲ୍ଲୀ",
    hi: "नयापल्ली",
    bn: "নয়াপল্লী",
    bho: "नयापल्ली"
  }, {
    en: "Jayadev Vihar",
    or: "ଜୟଦେବ ବିହାର",
    hi: "जयदेव विहार",
    bn: "জয়দেব বিহার",
    bho: "जयदेव विहार"
  }, {
    en: "Tamando",
    or: "ତମାଣ୍ଡୋ",
    hi: "तमांडो",
    bn: "তমান্ডো",
    bho: "तमांडो"
  }, {
    en: "Tomando",
    or: "ତମାଣ୍ଡୋ",
    hi: "तमांडो",
    bn: "তমান্ডো",
    bho: "तमांडो"
  }, {
    en: "Madanpur",
    or: "ମଦନପୁର",
    hi: "मदनपुर",
    bn: "মদনপুর",
    bho: "मदनपुर"
  }, {
    en: "Retanga",
    or: "ରେତାଙ୍ଗ",
    hi: "रेतांग",
    bn: "রেতাঙ্গ",
    bho: "रेतांग"
  }, {
    en: "Bhojpur",
    or: "ଭୋଜପୁର",
    hi: "भोजपुर",
    bn: "ভোজপুর",
    bho: "भोजपुर"
  }, {
    en: "Patna",
    or: "ପାଟନା",
    hi: "पटना",
    bn: "পাটনা",
    bho: "पटना"
  }, {
    en: "Gaya",
    or: "ଗୟା",
    hi: "गया",
    bn: "গয়া",
    bho: "गया"
  }, {
    en: "Muzaffarpur",
    or: "ମୁଜାଫରପୁର",
    hi: "मुजफ्फरपुर",
    bn: "মুজাফফরপুর",
    bho: "मुजफ्फरपुर"
  }, {
    en: "Siwan",
    or: "ସିୱାନ",
    hi: "सीवान",
    bn: "সিওয়ান",
    bho: "सीवान"
  }, {
    en: "Chapra",
    or: "ଛପରା",
    hi: "छपरा",
    bn: "ছাপরা",
    bho: "छपरा"
  }, {
    en: "Kolkata",
    or: "କୋଲକାତା",
    hi: "कोलकाता",
    bn: "কলকাতা",
    bho: "कोलकाता"
  }, {
    en: "Howrah",
    or: "ହାୱଡ଼ା",
    hi: "हावड़ा",
    bn: "হাওড়া",
    bho: "हावड़ा"
  }, {
    en: "Asansol",
    or: "ଆସନସୋଲ",
    hi: "आसनसोल",
    bn: "আসানসোল",
    bho: "आसनसोल"
  }, {
    en: "Delhi",
    or: "ଦିଲ୍ଲୀ",
    hi: "दिल्ली",
    bn: "দিল্লি",
    bho: "दिल्ली"
  }, {
    en: "Odisha",
    or: "ଓଡ଼ିଶା",
    hi: "ओडिशा",
    bn: "ওড়িশা",
    bho: "ओडिशा"
  }, {
    en: "Orissa",
    or: "ଓଡ଼ିଶା",
    hi: "ओडिशा",
    bn: "ওড়িশা",
    bho: "ओडिशा"
  }, {
    en: "Bihar",
    or: "ବିହାର",
    hi: "बिहार",
    bn: "বিহার",
    bho: "बिहार"
  }, {
    en: "West Bengal",
    or: "ପଶ୍ଚିମ ବଙ୍ଗ",
    hi: "पश्चिम बंगाल",
    bn: "পশ্চিমবঙ্গ",
    bho: "पश्चिम बंगाल"
  }, {
    en: "Uttar Pradesh",
    or: "ଉତ୍ତର ପ୍ରଦେଶ",
    hi: "उत्तर प्रदेश",
    bn: "উত্তর প্রদেশ",
    bho: "उत्तर प्रदेश"
  }, {
    en: "Jharkhand",
    or: "ଝାଡ଼ଖଣ୍ଡ",
    hi: "झारखंड",
    bn: "ঝাড়খণ্ড",
    bho: "झारखंड"
  }, {
    en: "Madhya Pradesh",
    or: "ମଧ୍ୟ ପ୍ରଦେଶ",
    hi: "मध्य प्रदेश",
    bn: "মধ্যপ্রদেশ",
    bho: "मध्य प्रदेश"
  }, {
    en: "Rajasthan",
    or: "ରାଜସ୍ଥାନ",
    hi: "राजस्थान",
    bn: "রাজস্থান",
    bho: "राजस्थान"
  }, {
    en: "Haryana",
    or: "ହରିୟାଣା",
    hi: "हरियाणा",
    bn: "হরিয়ানা",
    bho: "हरियाणा"
  }, {
    en: "Chhattisgarh",
    or: "ଛତିଶଗଡ଼",
    hi: "छत्तीसगढ़",
    bn: "ছত্তিশগড়",
    bho: "छत्तीसगढ़"
  }, {
    en: "India",
    or: "ଭାରତ",
    hi: "भारत",
    bn: "ভারত",
    bho: "भारत"
  }, {
    en: "Plot",
    or: "ପ୍ଲଟ",
    hi: "प्लॉट",
    bn: "প্লট",
    bho: "प्लॉट"
  }, {
    en: "Nagar",
    or: "ନଗର",
    hi: "नगर",
    bn: "নগর",
    bho: "नगर"
  }, {
    en: "Chowk",
    or: "ଛକ",
    hi: "चौक",
    bn: "চক",
    bho: "चौक"
  }, {
    en: "Square",
    or: "ଛକ",
    hi: "चौक",
    bn: "চক",
    bho: "चौक"
  }, {
    en: "Sahi",
    or: "ସାହି",
    hi: "साही",
    bn: "সাহি",
    bho: "साही"
  }, {
    en: "Ward",
    or: "ୱାର୍ଡ",
    hi: "वार्ड",
    bn: "ওয়ার্ড",
    bho: "वार्ड"
  }, {
    en: "GP",
    or: "ଗ୍ରାମ ପଞ୍ଚାୟତ",
    hi: "ग्राम पंचायत",
    bn: "গ্রাম পঞ্চায়েত",
    bho: "ग्राम पंचायत"
  }, {
    en: "Gram Panchayat",
    or: "ଗ୍ରାମ ପଞ୍ଚାୟତ",
    hi: "ग्राम पंचायत",
    bn: "গ্রাম পঞ্চায়েত",
    bho: "ग्राम पंचायत"
  }, {
    en: "District",
    or: "ଜିଲ୍ଲା",
    hi: "जिला",
    bn: "জেলা",
    bho: "जिला"
  }, {
    en: "Region",
    or: "ଅଞ୍ଚଳ",
    hi: "क्षेत्र",
    bn: "অঞ্চল",
    bho: "इलाका"
  }, {
    en: "Locating...",
    or: "ସ୍ଥାନ ଚିହ୍ନଟ ହେଉଛି...",
    hi: "स्थान खोजा जा रहा है...",
    bn: "অবস্থান সনাক্ত করা হচ্ছে...",
    bho: "लोकेशन खोजल जा रहल बा..."
  }, {
    en: "Current Location",
    or: "ବର୍ତ୍ତମାନ ସ୍ଥାନ",
    hi: "वर्तमान स्थान",
    bn: "বর্তমান অবস্থান",
    bho: "अबो के लोकेशन"
  }, {
    en: "Live Location",
    or: "ଲାଇଭ୍ ସ୍ଥାନ",
    hi: "लाइव स्थान",
    bn: "লাইভ অবস্থান",
    bho: "लाइव लोकेशन"
  }, {
    en: "Local Area",
    or: "ସ୍ଥାନୀୟ ଅଞ୍ଚଳ",
    hi: "स्थानीय क्षेत्र",
    bn: "স্থানীয় এলাকা",
    bho: "स्थानीय इलाका"
  }, {
    en: "North India",
    or: "ଉତ୍ତର ଭାରତ",
    hi: "उत्तर भारत",
    bn: "উত্তর ভারত",
    bho: "उत्तर भारत"
  }, {
    en: "Northern India Region",
    or: "ଉତ୍ତର ଭାରତ ଅଞ୍ଚଳ",
    hi: "उत्तर भारत क्षेत्र",
    bn: "উত্তর ভারত অঞ্চল",
    bho: "उत्तर भारत इलाका"
  }];

const localizeAddress = (addressStr, lang = 'hi') => {
    if (!addressStr) return "";
    const targetLang = lang || 'en';
    let result = String(addressStr);
    LOCATION_TRANSLATION_ENTITIES.forEach(entity => {
      const targetReplacement = entity[targetLang] || entity['en'] || entity['hi'] || '';
      if (!targetReplacement) return;
      const allVariants = [entity.en, entity.or, entity.hi, entity.bn, entity.bho].filter(Boolean);
      allVariants.sort((a, b) => b.length - a.length);
      allVariants.forEach(variant => {
        if (!variant) return;
        const isAscii = /^[\x00-\x7F]+$/.test(variant);
        const escaped = variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = isAscii ? new RegExp(`\\b${escaped}\\b`, 'gi') : new RegExp(escaped, 'g');
        result = result.replace(pattern, targetReplacement);
      });
    });

    return result.trim();
  };

  window.SIMULATED_REGIONS = SIMULATED_REGIONS;
  window.CIVIC_BACKGROUNDS = CIVIC_BACKGROUNDS;
  window.INITIAL_NOTIFICATIONS = INITIAL_NOTIFICATIONS;
  window.generateAutoProblemTitle = generateAutoProblemTitle;
  window.parseGpsCoords = parseGpsCoords;
  window.getDistanceKm = getDistanceKm;
  window.LOCATION_TRANSLATION_ENTITIES = LOCATION_TRANSLATION_ENTITIES;
  window.localizeAddress = localizeAddress;
})();
