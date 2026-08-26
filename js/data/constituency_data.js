/**
 * People's Priorities - Constituency Master & Demo Data
 * Synthetic Ground Truth & Registry for Sundargarh Assembly Constituency
 */

export const CONSTITUENCY_INFO = {
  name: "Sundargarh Rural & Urban Assembly Constituency",
  code: "AC-134",
  district: "Sundargarh District",
  state: "Odisha",
  total_population: 284000,
  rural_population_pct: 68.4,
  urban_population_pct: 31.6,
  villages_count: 142,
  urban_wards_count: 24,
  allocated_budget_cr: 10.0
};

export const DEMO_VILLAGES_AND_WARDS = [
  { id: "V01", name: "Kalyanpur Gram Panchayat", type: "rural", block: "Lathikata", population: 4200, lat: 22.1245, lng: 84.0321, vulnerability: "High", literacy_pct: 62 },
  { id: "V02", name: "Birmitrapur Border Area", type: "rural", block: "Birmitrapur", population: 6100, lat: 22.1480, lng: 84.0890, vulnerability: "High", literacy_pct: 58 },
  { id: "V03", name: "Gopabandhu Nagar Ward 4", type: "urban", block: "Sector-4 Ward", population: 12400, lat: 22.2150, lng: 84.1420, vulnerability: "Medium", literacy_pct: 84 },
  { id: "V04", name: "Brahmani Valley Village", type: "rural", block: "Panposh", population: 3800, lat: 22.1890, lng: 84.0150, vulnerability: "Medium", literacy_pct: 69 },
  { id: "V05", name: "Jhirpani Tribal Hamlet", type: "extreme_rural", block: "Bisra", population: 2900, lat: 22.2450, lng: 84.2100, vulnerability: "Critical", literacy_pct: 44 },
  { id: "V06", name: "Koel River Colony Ward 8", type: "urban", block: "Koel Ward", population: 8900, lat: 22.2300, lng: 84.1650, vulnerability: "High", literacy_pct: 71 },
  { id: "V07", name: "Mandira Forest Fringe Hamlet", type: "extreme_rural", block: "Lathikata", population: 1850, lat: 22.0950, lng: 83.9800, vulnerability: "Critical", literacy_pct: 48 },
  { id: "V08", name: "Nuagaon Agricultural Belt", type: "rural", block: "Bisra", population: 5400, lat: 22.1620, lng: 84.2250, vulnerability: "Medium", literacy_pct: 64 },
  { id: "V09", name: "Civil Township Zone 2", type: "urban", block: "Central Ward", population: 15600, lat: 22.2500, lng: 84.1200, vulnerability: "Low", literacy_pct: 92 },
  { id: "V10", name: "Kansbahal Industrial Corridor", type: "semi_urban", block: "Rajgangpur", population: 7200, lat: 22.1750, lng: 83.9200, vulnerability: "Medium", literacy_pct: 76 }
];

export const DEMO_FACILITIES = [
  { id: "FAC-01", name: "Kalyanpur Primary Health Centre", type: "Health (PHC)", lat: 22.1260, lng: 84.0350, capacity: "6 Beds", status: "Operational (Cut off in Monsoon)" },
  { id: "FAC-02", name: "Birmitrapur Health Sub-Centre", type: "Health (Sub-Centre)", lat: 22.1510, lng: 84.0910, capacity: "OPD Only", status: "Staffing Deficit" },
  { id: "FAC-03", name: "Gopabandhu Govt High School", type: "Education", lat: 22.2170, lng: 84.1440, capacity: "450 Students (4 Classrooms)", status: "Severe Overcrowding" },
  { id: "FAC-04", name: "Jhirpani Piped Tap Stand #1", type: "Water", lat: 22.2430, lng: 84.2080, capacity: "Dry / Broken Pump", status: "Non-Functional" },
  { id: "FAC-05", name: "Koel Outfall Storm Sluice Gate", type: "Drainage", lat: 22.2280, lng: 84.1680, capacity: "Silted Canal", status: "Choked / Flooding Risk" },
  { id: "FAC-06", name: "Nuagaon Mandi Aggregation Yard", type: "Agriculture", lat: 22.1600, lng: 84.2230, capacity: "Open Shed (No Chilling)", status: "Perishables Spoilage" },
  { id: "FAC-07", name: "Rourkela Govt District Hospital", type: "Health (Tertiary)", lat: 22.2400, lng: 84.1500, capacity: "400 Beds", status: "Tertiary Referral Hub" }
];

export const MULTILINGUAL_SAMPLE_PHRASES = [
  {
    lang: "Odia",
    text: "ଆମ ଗାଁ କଲ୍ୟାଣପୁରରୁ ଡାକ୍ତରଖାନା ଯିବା ରାସ୍ତା ବର୍ଷା ଦିନେ ପୂରା ଭାଙ୍ଗି ଯାଉଛି। ରୋଗୀ ମାନେ ୨୪ କିଲୋମିଟର ଦୂର ଯିବାକୁ ବାଧ୍ୟ ହେଉଛନ୍ତି।",
    translation: "The road from our village Kalyanpur to the hospital gets completely washed out during rains. Patients are forced to travel 24 km around.",
    category: "Roads & Healthcare",
    severity: "Critical",
    location: "Kalyanpur Gram Panchayat",
    impact: "Severe healthcare access blockage for 18,400 residents during monsoon emergency."
  },
  {
    lang: "Hindi",
    text: "हमारे गांव झिरपानी में पीने का पानी बहुत खारा और लाल आ रहा है। हैंडपंप खराब है और बच्चे बीमार पड़ रहे हैं।",
    translation: "In our village Jhirpani, the drinking water is saline and reddish with heavy fluoride. The handpump is broken and children are falling sick.",
    category: "Water",
    severity: "High",
    location: "Jhirpani Tribal Hamlet",
    impact: "Fluoride and waterborne contamination affecting 2,900 tribal villagers."
  },
  {
    lang: "English",
    text: "Gopabandhu High School has only 4 classrooms for 450 students. Classes are being taken under trees.",
    translation: "Gopabandhu High School has only 4 classrooms for 450 students. Classes are being taken under trees.",
    category: "Education",
    severity: "High",
    location: "Gopabandhu Nagar Ward 4",
    impact: "Acute classroom shortage causing 18% student drop-out and safety hazard during heatwaves."
  },
  {
    lang: "Bengali",
    text: "কয়েল নদীর কলোনিতে বর্ষার জল নিষ্কাশন না থাকায় প্রতি বছর ঘরে জল ঢুকে যায়। ড্রেনের অবিলম্বে সংস্কার দরকার।",
    translation: "In Koel River Colony, lack of storm drainage causes severe house inundation every monsoon. Drainage trunk line is urgently needed.",
    category: "Drainage",
    severity: "High",
    location: "Koel River Colony Ward 8",
    impact: "Direct flooding hazard for 8,900 low-lying urban residents."
  }
];

// Pre-generated 1,248 Citizen Submissions
export function generateLocalSubmissions() {
  const categories = [
    { cat: "Roads", subcat: "Rural All-Weather Road Connectivity", w: 0.35, sev: "High" },
    { cat: "Healthcare", subcat: "Healthcare Accessibility & PHC Staffing", w: 0.25, sev: "Critical" },
    { cat: "Education", subcat: "School Classrooms & STEM Infrastructure", w: 0.15, sev: "Medium" },
    { cat: "Water", subcat: "Piped Drinking Water & Fluoride Filter", w: 0.12, sev: "High" },
    { cat: "Drainage", subcat: "Monsoon Flood Drainage Overflow", w: 0.08, sev: "Medium" },
    { cat: "Electricity", subcat: "Transformer & Power Feeder Upgrades", w: 0.05, sev: "Low" }
  ];

  const langs = ["Odia", "Hindi", "English", "Bengali", "Santali"];
  const types = ["voice", "text", "photo", "assisted_field"];
  const list = [];

  for (let i = 1; i <= 1248; i++) {
    // Select category based on weights
    let r = (i * 17) % 100 / 100;
    let acc = 0;
    let selected = categories[0];
    for (const c of categories) {
      acc += c.w;
      if (r <= acc) { selected = c; break; }
    }

    const village = DEMO_VILLAGES_AND_WARDS[i % DEMO_VILLAGES_AND_WARDS.length];
    const latJitter = ((i * 31) % 50 - 25) * 0.0006;
    const lngJitter = ((i * 47) % 50 - 25) * 0.0006;

    const lang = langs[i % langs.length];
    const inputType = types[i % types.length];
    const sev = (i % 5 === 0) ? "Critical" : (i % 3 === 0) ? "High" : (i % 2 === 0) ? "Medium" : "Low";
    const verStatus = (i % 4 === 0) ? "Verified" : (i % 3 === 0) ? "Partially Verified" : (i % 7 === 0) ? "Discrepancy Found" : "Unverified";

    list.push({
      id: `SUB-${1000 + i}`,
      citizen_id: `CIT-${1000 + (i * 7) % 8999}`,
      timestamp: new Date(Date.now() - (i * 1800000)).toISOString().replace("T", " ").substring(0, 19),
      language: lang,
      input_type: inputType,
      administrative_area: village.name,
      block: village.block,
      area_type: village.type,
      category: selected.cat,
      sub_category: selected.subcat,
      issue_description: `Citizen reported pressing issue regarding ${selected.subcat.toLowerCase()} in ${village.name}.`,
      latitude: parseFloat((village.lat + latJitter).toFixed(5)),
      longitude: parseFloat((village.lng + lngJitter).toFixed(5)),
      severity: sev,
      affected_population_estimate: 800 + ((i * 137) % 17000),
      verification_status: verStatus,
      confidence: parseFloat((0.70 + ((i * 19) % 28) / 100).toFixed(2)),
      is_assisted: inputType === "assisted_field",
      evidence_files: inputType === "photo" ? [`evidence_capture_${i % 6 + 1}.jpg`] : []
    });
  }

  return list;
}

export const INITIAL_SUBMISSIONS = generateLocalSubmissions();
