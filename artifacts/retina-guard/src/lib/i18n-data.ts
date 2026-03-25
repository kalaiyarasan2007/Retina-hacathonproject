// ─── Language types ───────────────────────────────────────────────────────────
export type LangCode = "en-US" | "ta-IN" | "hi-IN" | "te-IN" | "ml-IN";

export interface Language {
  code: LangCode;
  label: string;
  native: string;
}

export const LANGUAGES: Language[] = [
  { code: "en-US", label: "English",   native: "English"     },
  { code: "ta-IN", label: "Tamil",     native: "தமிழ்"        },
  { code: "hi-IN", label: "Hindi",     native: "हिंदी"        },
  { code: "te-IN", label: "Telugu",    native: "తెలుగు"       },
  { code: "ml-IN", label: "Malayalam", native: "മലയാളം"      },
];

// ─── DR Stage labels ──────────────────────────────────────────────────────────
export const DR_STAGE_LABELS: Record<LangCode, string[]> = {
  "en-US": [
    "No Diabetic Retinopathy",
    "Mild Diabetic Retinopathy",
    "Moderate Diabetic Retinopathy",
    "Severe Diabetic Retinopathy",
    "Proliferative Diabetic Retinopathy",
  ],
  "ta-IN": [
    "நீரிழிவு விழித்திரை நோய் இல்லை",
    "லேசான நீரிழிவு விழித்திரை நோய்",
    "மிதமான நீரிழிவு விழித்திரை நோய்",
    "கடுமையான நீரிழிவு விழித்திரை நோய்",
    "பெருக்க நீரிழிவு விழித்திரை நோய்",
  ],
  "hi-IN": [
    "कोई डायबिटिक रेटिनोपैथी नहीं",
    "हल्की डायबिटिक रेटिनोपैथी",
    "मध्यम डायबिटिक रेटिनोपैथी",
    "गंभीर डायबिटिक रेटिनोपैथी",
    "प्रोलिफेरेटिव डायबिटिक रेटिनोपैथी",
  ],
  "te-IN": [
    "డయాబెటిక్ రెటినోపతి లేదు",
    "తేలికపాటి డయాబెటిక్ రెటినోపతి",
    "మధ్యస్థ డయాబెటిక్ రెటినోపతి",
    "తీవ్రమైన డయాబెటిక్ రెటినోపతి",
    "ప్రోలిఫెరేటివ్ డయాబెటిక్ రెటినోపతి",
  ],
  "ml-IN": [
    "ഡയബറ്റിക് റെറ്റിനോപ്പതി ഇല്ല",
    "ലഘുവായ ഡയബറ്റിക് റെറ്റിനോപ്പതി",
    "മിതമായ ഡയബറ്റിക് റെറ്റിനോപ്പതി",
    "കഠിനമായ ഡയബറ്റിക് റെറ്റിനോപ്പതി",
    "പ്രോലിഫെറേറ്റിവ് ഡയബറ്റിക് റെറ്റിനോപ്പതി",
  ],
};

// ─── Risk level labels ────────────────────────────────────────────────────────
export const RISK_LABELS: Record<LangCode, Record<string, string>> = {
  "en-US": { low: "Low",       medium: "Medium",      high: "High",      critical: "Critical"           },
  "ta-IN": { low: "குறைந்த",   medium: "நடுத்தர",     high: "அதிக",      critical: "மிகவும் அபாயகரமான"  },
  "hi-IN": { low: "कम",        medium: "मध्यम",        high: "उच्च",      critical: "अति गंभीर"           },
  "te-IN": { low: "తక్కువ",    medium: "మధ్యస్థం",    high: "అధికం",     critical: "అత్యంత తీవ్రం"       },
  "ml-IN": { low: "കുറഞ്ഞ",   medium: "മധ്യനില",     high: "ഉയർന്ന",   critical: "അതിഗുരുതര"          },
};

// ─── UI strings ───────────────────────────────────────────────────────────────
export interface UIStrings {
  scanResults: string;
  drStage: string;
  aiConfidence: string;
  blindnessRisk: string;
  aiRecommendation: string;
  retinalAnalysis: string;
  heatmapNote: string;
  criticalHeading: string;
  criticalBody: string;
  listenBtn: string;
  stopBtn: string;
  printReport: string;
  confirmedBy: string;
  clinicalNotes: string;
  doctorReviewHeading: string;
  confirmDiagnosis: string;
  saving: string;
  notesPlaceholder: string;
  noImage: string;
  loading: string;
  notFound: string;
  highLegend: string;
  medLegend: string;
  // Report specific labels
  clinicalReport: string;
  patientInfo: string;
  summary: string;
  ageGender: string;
  diabetesType: string;
  physicianNotes: string;
  analysisImage: string;
  treatmentPlan: string;
  name: string;
  gender: string;
  clinicalStatus: string;
  pending: string;
  confirmed: string;
  footerLine1: string;
  footerLine2: string;
  automatedAssessment: string;
}

export const UI: Record<LangCode, UIStrings> = {
  "en-US": {
    scanResults:         "Scan Results",
    drStage:             "DR Stage",
    aiConfidence:        "AI Confidence",
    blindnessRisk:       "Blindness Risk",
    aiRecommendation:    "AI Recommendation",
    retinalAnalysis:     "Retinal Fundus Analysis",
    heatmapNote:         "*Heatmap highlights regions indicative of microaneurysms and exudates.",
    criticalHeading:     "CRITICAL FINDINGS",
    criticalBody:        "Immediate medical intervention is highly recommended. High risk of vision loss.",
    listenBtn:           "Listen",
    stopBtn:             "Stop",
    printReport:         "Print Report",
    confirmedBy:         "Confirmed by Dr.",
    clinicalNotes:       "Clinical Notes:",
    doctorReviewHeading: "Doctor Review Required",
    confirmDiagnosis:    "Confirm Diagnosis",
    saving:              "Saving...",
    notesPlaceholder:    "Add clinical notes or override AI findings...",
    noImage:             "No Image Data Available",
    loading:             "Loading Scan Data...",
    notFound:            "Scan not found.",
    highLegend:          "High",
    medLegend:           "Med",
    clinicalReport:      "RetinaGuard Clinical Report",
    patientInfo:         "Patient Information",
    summary:             "Diagnostic Summary",
    ageGender:           "Age / Gender",
    diabetesType:        "Diabetes Type",
    physicianNotes:      "Physician Notes",
    analysisImage:       "Analysis Image",
    treatmentPlan:       "Recommended Treatment Plan",
    name:                "Name",
    gender:              "Gender",
    clinicalStatus:      "Clinical Status",
    pending:             "Pending Review",
    confirmed:           "Confirmed",
    footerLine1:         "This report is generated by AI and intended as a clinical decision support tool. It does not replace a comprehensive ophthalmic examination.",
    footerLine2:         "RetinaGuard System • Confidential Patient Information • HIPAA Compliant",
    automatedAssessment: "Automated Diabetic Retinopathy Assessment",
  },
  "ta-IN": {
    scanResults:         "ஸ்கேன் பரிசோதனை முடிவுகள்",
    drStage:             "நீரிழிவு கண்நோய் நிலை",
    aiConfidence:        "ஏஐ முடிவின் நம்பிக்கை அளவு",
    blindnessRisk:       "மருத்துவ அபாய மதிப்பெண்",
    aiRecommendation:    "ஏஐ மருத்துவ பரிந்துரை",
    retinalAnalysis:     "கண் ரெட்டினா படப் பகுப்பாய்வு",
    heatmapNote:         "*சிவப்பு மற்றும் மஞ்சள் நிறக் குறிகள் கண்ணில் பாதிக்கப்பட்ட பகுதிகளைக் காட்டுகின்றன.",
    criticalHeading:     "மிகவும் அவசரமான கண்டுபிடிப்பு",
    criticalBody:        "உடனடியாக மருத்துவரை சந்திக்கவும். பார்வை இழக்கும் அபாயம் மிக அதிகமாக உள்ளது.",
    listenBtn:           "கேளுங்கள்",
    stopBtn:             "நிறுத்து",
    printReport:         "அறிக்கை அச்சிடு",
    confirmedBy:         "மருத்துவர் உறுதிப்படுத்தியவர்:",
    clinicalNotes:       "மருத்துவ குறிப்புகள்:",
    doctorReviewHeading: "மருத்துவர் ஆய்வு தேவை",
    confirmDiagnosis:    "நோய் கண்டறிதலை உறுதிப்படுத்து",
    saving:              "சேமிக்கிறது...",
    notesPlaceholder:    "மருத்துவ குறிப்புகள் சேர்க்கவும் அல்லது ஏஐ முடிவை திருத்தவும்...",
    noImage:             "படம் கிடைக்கவில்லை",
    loading:             "ஸ்கேன் தரவு ஏற்றுகிறது...",
    notFound:            "ஸ்கேன் கிடைக்கவில்லை.",
    highLegend:          "அதிக பாதிப்பு",
    medLegend:           "மிதமான பாதிப்பு",
    clinicalReport:      "ரெட்டினாகார்டு மருத்துவ அறிக்கை",
    patientInfo:         "நோயாளி தகவல்",
    summary:             "கண்டறிதல் சுருக்கம்",
    ageGender:           "வயது / பாலினம்",
    diabetesType:        "நீரிழிவு வகை",
    physicianNotes:      "மருத்துவர் குறிப்புகள்",
    analysisImage:       "பகுப்பாய்வு படம்",
    treatmentPlan:       "பரிந்துரைக்கப்பட்ட சிகிச்சை திட்டம்",
    name:                "பெயர்",
    gender:              "பாலினம்",
    clinicalStatus:      "மருத்துவ நிலை",
    pending:             "ஆய்வில் உள்ளது",
    confirmed:           "உறுதிப்படுத்தப்பட்டது",
    footerLine1:         "இந்த அறிக்கை ஏஐ மூலம் உருவாக்கப்பட்டது மற்றும் மருத்துவ முடிவு ஆதரவு கருவியாக மட்டுமே கருதப்படுகிறது. இது முழுமையான கண் பரிசோதனைக்கு மாற்றாகாது.",
    footerLine2:         "ரெட்டினாகார்டு அமைப்பு • ரகசிய நோயாளி தகவல் • HIPAA இணக்கமானது",
    automatedAssessment: "தானியங்கி நீரிழிவு கண் நோய் மதிப்பீடு",
  },
  "hi-IN": {
    scanResults:         "स्कैन परिणाम",
    drStage:             "DR चरण",
    aiConfidence:        "AI विश्वास",
    blindnessRisk:       "अंधापन जोखिम",
    aiRecommendation:    "AI सिफारिश",
    retinalAnalysis:     "रेटिनल फंडस विश्लेषण",
    heatmapNote:         "*हीटमैप माइक्रोएन्यूरिज्म और एक्सुडेट्स के क्षेत्रों को इंगित करता है।",
    criticalHeading:     "गभीर निष्कर्ष",
    criticalBody:        "तत्काल चिकित्सा हस्तक्षेप की अत्यधिक अनुशंसा की जाती है। दृष्टि हानि का उच्च जोखिम।",
    listenBtn:           "सुनें",
    stopBtn:             "रोकें",
    printReport:         "रिपोर्ट प्रिंट करें",
    confirmedBy:         "डॉ. द्वारा पुष्टि की गई।",
    clinicalNotes:       "नैदानिक नोट्स:",
    doctorReviewHeading: "डॉक्टर समीक्षा आवश्यक है",
    confirmDiagnosis:    "निदान की पुष्टि करें",
    saving:              "सहेज रहा है...",
    notesPlaceholder:    "नैदानिक नोट जोड़ें या AI निष्कर्षों को ओवरराइड करें...",
    noImage:             "कोई छवि डेटा उपलब्ध नहीं",
    loading:             "स्कैन डेटा लोड हो रहा है...",
    notFound:            "स्कैन नहीं मिला।",
    highLegend:          "उच्च",
    medLegend:           "मध्यम",
    clinicalReport:      "रेटिनागार्ड क्लिनिकल रिपोर्ट",
    patientInfo:         "मरीज की जानकारी",
    summary:             "नैदानिक सारांश",
    ageGender:           "आयु / लिंग",
    diabetesType:        "मधुमेह प्रकार",
    physicianNotes:      "चिकित्सक नोट्स",
    analysisImage:       "विश्लेषण छवि",
    treatmentPlan:       "अनुशंसित उपचार योजना",
    name:                "नाम",
    gender:              "लिंग",
    clinicalStatus:      "नैदानिक स्थिति",
    pending:             "समीक्षा लंबित",
    confirmed:           "पुष्टि की गई",
    footerLine1:         "यह रिपोर्ट एआई द्वारा उत्पन्न की गई है और इसका उद्देश्य नैदानिक निर्णय समर्थन उपकरण के रूप में कार्य करना है। यह व्यापक नेत्र परीक्षण का विकल्प नहीं है।",
    footerLine2:         "रेटिनागार्ड सिस्टम • गोपनीय रोगी जानकारी • HIPAA अनुपालन",
    automatedAssessment: "स्वचालित डायबिटिक रेटिनोपैथी मूल्यांकन",
  },
  "te-IN": {
    scanResults:         "స్కాన్ ఫలితాలు",
    drStage:             "DR దశ",
    aiConfidence:        "AI నమ్మకం",
    blindnessRisk:       "అంధత్వ ప్రమాదం",
    aiRecommendation:    "AI సిఫారసు",
    retinalAnalysis:     "రెటీనల్ ఫండస్ విశ్లేషణ",
    heatmapNote:         "*హీట్‌మ్యాప్ మైక్రోఆన్యూరిజమ్‌లు మరియు ఎక్సూడేట్‌ల ప్రాంతాలను సూచిస్తుంది.",
    criticalHeading:     "క్లిష్టమైన నిర్ధారణలు",
    criticalBody:        "తక్షణ వైద్య జోక్యం అత్యంత సిఫార్సు చేయబడింది. దృష్టి కోల్పోయే ప్రమాదం ఎక్కువగా ఉంది.",
    listenBtn:           "వినండి",
    stopBtn:             "ఆపు",
    printReport:         "నివేదిక ముద్రించు",
    confirmedBy:         "డాక్టర్ ధృవీకరించారు.",
    clinicalNotes:       "క్లినికల్ నోట్స్:",
    doctorReviewHeading: "డాక్టర్ సమీక్ష అవసరం",
    confirmDiagnosis:    "రోగనిర్ధారణను నిర్ధారించండి",
    saving:              "సేవ్ అవుతోంది...",
    notesPlaceholder:    "క్లినికల్ నోట్స్ జోడించండి లేదా AI ఫలితాలను భర్తీ చేయండి...",
    noImage:             "చిత్ర డేటా అందుబాటులో లేదు",
    loading:             "స్కాన్ డేటా లోడ్ అవుతోంది...",
    notFound:            "స్కాన్ కనుగొనబడలేదు.",
    highLegend:          "అధికం",
    medLegend:           "మధ్యస్థం",
    clinicalReport:      "రెటినాగార్డ్ క్లినికల్ రిపోర్ట్",
    patientInfo:         "రోగి సమాచారం",
    summary:             "రోగనిర్ధారణ సారాంశం",
    ageGender:           "వయస్సు / లింగం",
    diabetesType:        "డయాబెటిస్ రకం",
    physicianNotes:      "వైద్యుని నోట్స్",
    analysisImage:       "విశ్లేషణ చిత్రం",
    treatmentPlan:       "సిఫార్సు చేయబడిన చికిత్స ప్రణాళిక",
    name:                "పేరు",
    gender:              "లింగం",
    clinicalStatus:      "క్లినికల్ స్థితి",
    pending:             "సమీక్ష పెండింగ్‌లో ఉంది",
    confirmed:           "ధృవీకరించబడింది",
    footerLine1:         "ఈ నివేదిక AI ద్వారా రూపొందించబడింది మరియు క్లినికల్ నిర్ణయ మద్దతు సాధనంగా ఉద్దేశించబడింది. ఇది సమగ్ర కంటి పరీక్షకు ప్రత్యామ్నాయం కాదు.",
    footerLine2:         "రెటినాగార్డ్ సిస్టమ్ • రహస్య రోగి సమాచారం • HIPAA కంప్లైంట్",
    automatedAssessment: "ఆటోమేటెడ్ డయాబెటిక్ రెటినోపతి మూల్యాంకనం",
  },
  "ml-IN": {
    scanResults:         "സ്‌കാൻ ഫലങ്ങൾ",
    drStage:             "DR ഘട്ടം",
    aiConfidence:        "AI ആത്മവിശ്വാസം",
    blindnessRisk:       "അന്ധത അപകടം",
    aiRecommendation:    "AI ശുപാർശ",
    retinalAnalysis:     "റെറ്റിനൽ ഫണ്ടസ് വിശകലനം",
    heatmapNote:         "*ഹീറ്റ്‌മാപ്പ് മൈക്രോആന്യൂറിസങ്ങളും എക്‌സൂഡേറ്റുകളും ഉള്ള ഭാഗങ്ങൾ ചൂണ്ടിക്കാണിക്കുന്നു.",
    criticalHeading:     "നിർണായക കണ്ടുപിടിത്തങ്ങൾ",
    criticalBody:        "ഉടനടി വൈദ്യ ഇടപെടൽ ശക്തമായി ശുപാർശ ചെയ്യുന്നു. കാഴ്ച നഷ്ടപ്പെടാനുള്ള ഉയർന്ന അപകടം.",
    listenBtn:           "കേൾക്കുക",
    stopBtn:             "നിർത്തുക",
    printReport:         "റിപ്പോർട്ട് പ്രിന്റ് ചെയ്യുക",
    confirmedBy:         "ഡോ. സ്ഥിരീകരിച്ചു.",
    clinicalNotes:       "ക്ലിനിക്കൽ കുറിപ്പുകൾ:",
    doctorReviewHeading: "ഡോക്ടർ അവലോകനം ആവശ്യമാണ്",
    confirmDiagnosis:    "രോഗനിർണ്ണയം സ്ഥിരീകരിക്കുക",
    saving:              "സംരക്ഷിക്കുന്നു...",
    notesPlaceholder:    "ക്ലിനിക്കൽ കുറിപ്പുകൾ ചേർക്കുക അല്ലെങ്കിൽ AI കണ്ടെത്തലുകൾ മേൽ എഴുതുക...",
    noImage:             "ചിത്ര ഡാറ്റ ലഭ്യമല്ല",
    loading:             "സ്‌കാൻ ഡാറ്റ ലോഡ് ചെയ്യുന്നു...",
    notFound:            "സ്‌കാൻ കണ്ടെത്തിയില്ല.",
    highLegend:          "ഉയർന്ന",
    medLegend:           "മധ്യനില",
    clinicalReport:      "റെറ്റിനാഗാർഡ് ക്ലിനിക്കൽ റിപ്പോർട്ട്",
    patientInfo:         "രോഗിയുടെ വിവരങ്ങൾ",
    summary:             "രോഗനിർണ്ണയ സംഗ്രഹം",
    ageGender:           "വയസ്സ് / ലിംഗഭേദം",
    diabetesType:        "പ്രമേഹ തരം",
    physicianNotes:      "ഫിസിഷ്യൻ കുറിപ്പുകൾ",
    analysisImage:       "വിശകലന ചിത്രം",
    treatmentPlan:       "ശുപാർശ ചെയ്യുന്ന ചികിത്സാ പദ്ധതി",
    name:                "പേര്",
    gender:              "ലിംഗഭേദം",
    clinicalStatus:      "ക്ലിനിക്കൽ നില",
    pending:             "അവലോകനം തീർപ്പാക്കിയിട്ടില്ല",
    confirmed:           "സ്ഥിരീകരിച്ചു",
    footerLine1:         "ഈ റിപ്പോർട്ട് AI ആണ് നിർമ്മിച്ചിരിക്കുന്നത്, ഇത് ഒരു ക്ലിനിക്കൽ തീരുമാന പിന്തുണ ഉപകരണമായി ഉദ്ദേശിച്ചിട്ടുള്ളതാണ്. ഇത് സമഗ്രമായ നേത്ര പരിശോധനയ്ക്ക് പകരമാവില്ല.",
    footerLine2:         "റെറ്റിനാഗാർഡ് സിസ്റ്റം • രഹസ്യ രോഗി വിവരങ്ങൾ • HIPAA കംപ്ലയിന്റ്",
    automatedAssessment: "യാന്ത്രിക ഡയബറ്റിക് റെറ്റിനോപ്പതി വിലയിരുത്തൽ",
  },
};

// ─── Translated recommendations (5 DR stages × 5 languages) ──────────────────
export const RECOMMENDATIONS: Record<LangCode, string[]> = {
  "en-US": [
    "Your retinal scan looks healthy. No signs of diabetic eye disease were found. Keep having your eyes checked once a year, and keep your blood sugar under control.",
    "Small changes were found in your retina. No treatment is needed right now. Visit your eye doctor every 6 months, eat healthy, and manage your blood sugar carefully.",
    "Noticeable changes were found in your retina. Please see an eye specialist within 3 to 6 months. Keep blood sugar tightly controlled. Laser treatment may be needed.",
    "URGENT: Serious damage found in your retina. See an eye specialist within 1 month. Do not delay — vision loss is possible if untreated. Treatment such as laser or injections may be required.",
    "EMERGENCY: Very severe damage found. Go to the hospital immediately. Surgery may be needed. Delay can cause permanent blindness.",
  ],
  "ta-IN": [
    "உங்கள் கண் ரெட்டினா படம் ஆய்வு செய்யப்பட்டது. தற்போது நீரிழிவு கண் நோயின் எந்த அறிகுறியும் காணப்படவில்லை. உங்கள் கண்கள் நல்ல நிலையில் உள்ளன. ஒவ்வொரு ஆண்டும் ஒரு முறை கண் பரிசோதனை செய்வது நல்லது. சர்க்கரை அளவை கட்டுப்பாட்டில் வையுங்கள்.",
    "உங்கள் கண் ரெட்டினாவில் லேசான மாற்றங்கள் கண்டுபிடிக்கப்பட்டுள்ளன. இப்போதைக்கு நேரடி சிகிச்சை தேவையில்லை. ஆனால், ஒவ்வொரு 6 மாதத்திற்கும் ஒரு முறை கண் மருத்துவரிடம் செல்லுங்கள். சர்க்கரை அளவை கட்டுப்படுத்தி, ஆரோக்கியமான உணவு சாப்பிடுங்கள்.",
    "உங்கள் கண் ரெட்டினாவில் குறிப்பிடத்தக்க மாற்றங்கள் தெரிகின்றன. 3 முதல் 6 மாதத்திற்குள் கண் நோய் நிபுணரிடம் சென்று பரிசோதனை செய்யுங்கள். சர்க்கரை அளவை கண்டிப்பாக கட்டுப்படுத்துங்கள். லேசர் சிகிச்சை தேவைப்படலாம்.",
    "மிகவும் அவசரம். உங்கள் கண் ரெட்டினாவில் கடுமையான பாதிப்பு கண்டுபிடிக்கப்பட்டுள்ளது. ஒரு மாதத்திற்குள் கண் நிபுணரை சந்திக்க வேண்டும். தாமதிக்காதீர்கள். சரியான நேரத்தில் சிகிச்சை பெறாவிட்டால் பார்வை இழக்கலாம்.",
    "மிகவும் தீவிரமான அவசர நிலை. உங்கள் கண்ணில் மிகவும் அதிகமான பாதிப்பு உள்ளது. உடனடியாக மருத்துவமனைக்கு செல்லுங்கள். கண் அறுவை சிகிச்சை தேவைப்படலாம். தாமதிக்காதீர்கள், பார்வை போய்விடலாம்.",
  ],
  "hi-IN": [
    "आपकी आंख की रेटिना जांच की गई। अभी कोई बीमारी के लक्षण नहीं हैं। आपकी आंखें ठीक हैं। हर साल एक बार आंखों की जांच करवाएं और शुगर लेवल को काबू में रखें।",
    "आपकी रेटिना में हल्के बदलाव मिले हैं। अभी इलाज की जरूरत नहीं है। हर 6 महीने में डॉक्टर से मिलें। खाने-पीने में सावधानी रखें और शुगर कंट्रोल करें।",
    "आपकी रेटिना में काफी बदलाव दिख रहे हैं। 3 से 6 महीने के अंदर आंख के विशेषज्ञ से मिलें। शुगर को सख्ती से काबू में रखें। लेजर इलाज की जरूरत पड़ सकती है।",
    "जरूरी: आपकी आंख में गंभीर खराबी पाई गई है। एक महीने के अंदर डॉक्टर से मिलें। देरी मत करें। सही समय पर इलाज न हो तो आंख की रोशनी जा सकती है।",
    "बहुत जरूरी: बहुत गंभीर स्थिति है। तुरंत अस्पताल जाएं। आंख का ऑपरेशन जरूरी हो सकता है। देरी करने पर आंख की रोशनी हमेशा के लिए जा सकती है।",
  ],
  "te-IN": [
    "మీ కంటి రెటీనా పరీక్ష చేయబడింది. ఇప్పుడు ఎటువంటి వ్యాధి లక్షణాలు కనిపించడం లేదు. మీ కళ్ళు ఆరోగ్యంగా ఉన్నాయి. ప్రతి సంవత్సరం ఒకసారి కంటి పరీక్ష చేయించుకోండి. చక్కెర స్థాయిని నియంత్రించండి.",
    "మీ రెటీనాలో తేలికపాటి మార్పులు కనిపిస్తున్నాయి. ఇప్పుడు నేరుగా చికిత్స అవసరం లేదు. ప్రతి 6 నెలలకు కంటి డాక్టర్‌ని చూడండి. ఆహారంలో జాగ్రత్తగా ఉండి చక్కెర తక్కువగా ఉంచండి.",
    "మీ రెటీనాలో గుర్తించదగిన మార్పులు కనిపిస్తున్నాయి. 3 నుండి 6 నెలలలో నిపుణ వైద్యుడిని సంప్రదించండి. చక్కెర స్థాయిని కచ్చితంగా నియంత్రించండి. లేజర్ చికిత్స అవసరం కావచ్చు.",
    "అత్యవసరం: మీ కంటిలో తీవ్రమైన సమస్య కనిపిస్తోంది. ఒక నెలలో కంటి నిపుణుడిని తప్పకుండా చూడండి. ఆలస్యం చేయకండి. సకాలంలో చికిత్స తీసుకోకపోతే చూపు పోవచ్చు.",
    "అత్యంత తీవ్రం: మీ కంటికి చాలా అధికంగా నష్టం జరిగింది. వెంటనే ఆసుపత్రికి వెళ్ళండి. కంటి శస్త్రచికిత్స అవసరం కావచ్చు. ఆలస్యం చేస్తే చూపు శాశ్వతంగా పోవచ్చు.",
  ],
  "ml-IN": [
    "നിങ്ങളുടെ കണ്ണിന്റെ റെറ്റിന പരിശോധിച്ചു. ഇപ്പോൾ ഒരു രോഗ ലക്ഷണവും കാണുന്നില്ല. കണ്ണുകൾ ആരോഗ്യകരമാണ്. എല്ലാ വർഷവും ഒരു തവണ കണ്ണ് പരിശോധന നടത്തുക. പഞ്ചസാര അളവ് നിയന്ത്രിക്കുക.",
    "റെറ്റിനയിൽ ചെറിയ മാറ്റങ്ങൾ കണ്ടെത്തി. ഇപ്പോൾ ചികിത്സ ആവശ്യമില്ല. എല്ലാ 6 മാസത്തിലും ഡോക്ടറെ കാണുക. ആരോഗ്യകരമായ ഭക്ഷണം കഴിക്കുക. പഞ്ചസാര നിയന്ത്രിക്കുക.",
    "റെറ്റിനയിൽ ശ്രദ്ധേയമായ മാറ്റങ്ങൾ കണ്ടെത്തി. 3 മുതൽ 6 മാസത്തിനുള്ളിൽ കണ്ണ് വിദഗ്ധനെ കാണുക. പഞ്ചസാര കർശനമായി നിയന്ത്രിക്കുക. ലേസർ ചികിത്സ ആവശ്യം വന്നേക്കാം.",
    "അടിയന്തരം: കണ്ണിൽ ഗുരുതരമായ തകരാർ കണ്ടെത്തി. ഒരു മാസത്തിനുള്ളിൽ ഡോക്ടറെ കണ്ടിരിക്കണം. വൈകരുത്. ശരിയായ സമയത്ത് ചികിത്സ ലഭിച്ചില്ലെങ്കിൽ കാഴ്ച നഷ്ടപ്പെടാം.",
    "വളരെ ഗുരുതരം: കണ്ണിന് ഏറ്റവും കൂടുതൽ കേടുപാടുകൾ ഉണ്ട്. ഉടൻ ആശുപത്രിയിൽ പോകുക. കണ്ണ് ശസ്ത്രക്രിയ ആവശ്യമാകാം. വൈകിയാൽ കാഴ്ച എന്നെന്നേക്കും നഷ്ടപ്പെടാം.",
  ],
};
