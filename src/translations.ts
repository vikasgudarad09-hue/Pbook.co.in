export type Language = 'kn' | 'en' | 'hi' | 'te' | 'ta';

export interface TranslationStrings {
  question: string;
  voted: string;
  share: string;
  checking: string;
  submitVote: string;
  vote: string;
  votes: string;
  viewAllResults: string;
  shareThisPoll: string;
  advertisement: string;
  copyLink: string;
  linkCopied: string;
  confirmVoteTitle: string;
  confirmVoteDesc: string;
  confirm: string;
  cancel: string;
  faqs: string;
  contactUs: string;
  adminPanel: string;
  totalVotes: string;
  languageName: string;
  alreadyVotedTitle: string;
  alreadyVotedMsg: string;
  backToVote: string;
}

export const languages: { code: Language; label: string; name: string }[] = [
  { code: 'kn', label: 'ಕನ್ನಡ', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'en', label: 'English', name: 'English' },
  { code: 'hi', label: 'हिंदी', name: 'हिंदी (Hindi)' },
  { code: 'te', label: 'తెలుగు', name: 'తెలుగు (Telugu)' },
  { code: 'ta', label: 'தமிழ்', name: 'தமிழ் (Tamil)' },
];

export const translations: Record<Language, TranslationStrings> = {
  kn: {
    question: "ಪ್ರಶ್ನೆ",
    voted: "ಮತ ಹಾಕಿದ್ದೀರಿ",
    share: "ಹಂಚಿಕೊಳ್ಳಿ",
    checking: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    submitVote: "ಮತ ಸಲ್ಲಿಸಿ",
    vote: "ಮತ",
    votes: "ಮತಗಳು",
    viewAllResults: "ಎಲ್ಲಾ ಫಲಿತಾಂಶಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    shareThisPoll: "ಈ ಪೋಲ್ ಅನ್ನು ಹಂಚಿಕೊಳ್ಳಿ",
    advertisement: "ಜಾಹೀರಾತು",
    copyLink: "ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ",
    linkCopied: "ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಲಾಗಿದೆ!",
    confirmVoteTitle: "ನಿಮ್ಮ ಮತವನ್ನು ಖಚಿತಪಡಿಸಿ",
    confirmVoteDesc: "ನೀವು ಈ ಕೆಳಗಿನ ಅಭ್ಯರ್ಥಿಗೆ ಮತ ನೀಡಲು ಬಯಸುತ್ತೀರಾ?",
    confirm: "ಖಚಿತಪಡಿಸಿ",
    cancel: "ರದ್ದುಮಾಡಿ",
    faqs: "ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು",
    contactUs: "ಸಂಪರ್ಕಿಸಿ",
    adminPanel: "ನಿರ್ವಾಹಕ ಫಲಕ",
    totalVotes: "ಒಟ್ಟು ಮತಗಳು",
    languageName: "ಕನ್ನಡ",
    alreadyVotedTitle: "ಈಗಾಗಲೇ ಮತ ಚಲಾಯಿಸಲಾಗಿದೆ",
    alreadyVotedMsg: "ಈ ಸಾಧನ/ನೆಟ್‌ವರ್ಕ್‌ನಿಂದ ಈಗಾಗಲೇ ಮತ ದಾಖಲಾಗಿದೆ.",
    backToVote: "ಮತದಾನಕ್ಕೆ ಹಿಂತಿರುಗಿ",
  },
  en: {
    question: "Question",
    voted: "Voted",
    share: "Share",
    checking: "Verifying...",
    submitVote: "Submit Vote",
    vote: "vote",
    votes: "votes",
    viewAllResults: "View All Results",
    shareThisPoll: "Share this poll",
    advertisement: "ADVERTISEMENT",
    copyLink: "Copy Link",
    linkCopied: "Link copied!",
    confirmVoteTitle: "Confirm Your Vote",
    confirmVoteDesc: "Are you sure you want to cast your vote for this option?",
    confirm: "Confirm Vote",
    cancel: "Cancel",
    faqs: "Frequently Asked Questions",
    contactUs: "Contact Us",
    adminPanel: "Admin Panel",
    totalVotes: "Total Votes",
    languageName: "English",
    alreadyVotedTitle: "Already Voted",
    alreadyVotedMsg: "A vote has already been submitted from this device/network.",
    backToVote: "Back to Voting",
  },
  hi: {
    question: "प्रश्न",
    voted: "वोट दिया गया",
    share: "शेयर करें",
    checking: "सत्यापित हो रहा है...",
    submitVote: "वोट जमा करें",
    vote: "वोट",
    votes: "वोट",
    viewAllResults: "सभी परिणाम देखें",
    shareThisPoll: "इस पोल को शेयर करें",
    advertisement: "विज्ञापन",
    copyLink: "लिंक कॉपी करें",
    linkCopied: "लिंक कॉपी हो गया!",
    confirmVoteTitle: "अपने वोट की पुष्टि करें",
    confirmVoteDesc: "क्या आप इस विकल्प के लिए अपना वोट देना चाहते हैं?",
    confirm: "पुष्टि करें",
    cancel: "रद्द करें",
    faqs: "अक्सर पूछे जाने वाले प्रश्न",
    contactUs: "संपर्क करें",
    adminPanel: "एडमिन पैनल",
    totalVotes: "कुल वोट",
    languageName: "हिंदी",
    alreadyVotedTitle: "पहले ही वोट दे चुके हैं",
    alreadyVotedMsg: "इस डिवाइस/नेटवर्क से पहले ही एक वोट दिया जा चुका है।",
    backToVote: "वोटिंग पर वापस जाएं",
  },
  te: {
    question: "ప్రశ్న",
    voted: "ఓటు వేశారు",
    share: "షేర్ చేయండి",
    checking: "పరిశీలిస్తోంది...",
    submitVote: "ఓటు వేయండి",
    vote: "ఓటు",
    votes: "ఓట్లు",
    viewAllResults: "అన్ని ఫలితాలను చూడండి",
    shareThisPoll: "ఈ పోల్‌ను షేర్ చేయండి",
    advertisement: "ప్రకటన",
    copyLink: "లింక్ కాపీ చేయండి",
    linkCopied: "లింక్ కాపీ చేయబడింది!",
    confirmVoteTitle: "మీ ఓటును ధృవీకరించండి",
    confirmVoteDesc: "మీరు ఈ ఎంపికకు ఓటు వేయాలనుకుంటున్నారా?",
    confirm: "ధృవీకరించు",
    cancel: "రద్దు చేయి",
    faqs: "తరచూ అడిగే ప్రశ్నలు",
    contactUs: "సెంప్రదించండి",
    adminPanel: "అడ్మిన్ ప్యానెల్",
    totalVotes: "మొత్తం ఓట్లు",
    languageName: "తెలుగు",
    alreadyVotedTitle: "ఇప్పటికే ఓటు వేశారు",
    alreadyVotedMsg: "ఈ పరికరం/నెట్‌వర్క్ నుండి ఇప్పటికే ఒక ఓటు సమర్పించబడింది.",
    backToVote: "ఓటింగ్‌కు తిరిగి వెళ్లండి",
  },
  ta: {
    question: "கேள்வி",
    voted: "வாக்களிக்கப்பட்டது",
    share: "பகிரவும்",
    checking: "சரிபார்க்கிறது...",
    submitVote: "வாக்களிக்கவும்",
    vote: "வாக்கு",
    votes: "வாக்குகள்",
    viewAllResults: "அனைத்து முடிவுகளையும் காண்க",
    shareThisPoll: "இந்த வாக்கெடுப்பை பகிரவும்",
    advertisement: "விளம்பரம்",
    copyLink: "லிங்க் நகலெடுக்கவும்",
    linkCopied: "லிங்க் நகலெடுக்கப்பட்டது!",
    confirmVoteTitle: "உங்கள் வாக்கை உறுதிப்படுத்தவும்",
    confirmVoteDesc: "இந்த விருப்பத்திற்கு நீங்கள் வாக்களிக்க விரும்புகிறீர்களா?",
    confirm: "உறுதிப்படுத்து",
    cancel: "ரத்து செய்",
    faqs: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
    contactUs: "தொடர்பு கொள்ளவும்",
    adminPanel: "நிர்வாகக் குழு",
    totalVotes: "மொத்த வாக்குகள்",
    languageName: "தமிழ்",
    alreadyVotedTitle: "ஏற்கனவே வாக்களிக்கப்பட்டுள்ளது",
    alreadyVotedMsg: "இந்த சாதனத்திலிருந்து ஏற்கனவே ஒரு வாக்கு சமர்ப்பிக்கப்பட்டுள்ளது.",
    backToVote: "வாக்களிப்பிற்குத் திரும்பு",
  }
};
