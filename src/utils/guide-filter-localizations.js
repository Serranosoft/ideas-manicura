// The guide filter is shared by every supported app locale.
const allLabels = {
    es: "Todos", en: "All", ar: "الكل", de: "Alle", hi: "सभी",
    fr: "Tous", id: "Semua", pt: "Todos", ru: "Все", pl: "Wszystkie",
    vi: "Tất cả", tr: "Tümü", it: "Tutti", fa: "همه", th: "ทั้งหมด",
    bn: "সব", fil: "Lahat", ta: "அனைத்தும்", te: "అన్నీ", ms: "Semua",
    ja: "すべて", ko: "전체", ur: "سب", "zh-TW": "全部", uk: "Усі",
    ro: "Toate", "nl-NL": "Alles", "iw-IL": "הכול", "zh-CN": "全部",
    "zh-HK": "全部", "pt-BR": "Todos", "pt-PT": "Todos", "mr-IN": "सर्व",
    gu: "બધા", pa: "ਸਾਰੇ", "ml-IN": "എല്ലാം", "kn-IN": "ಎಲ್ಲಾ",
    "ne-NP": "सबै", "si-LK": "සියල්ල", "my-MM": "အားလုံး",
    "km-KH": "ទាំងអស់", "el-GR": "Όλα", "cs-CZ": "Všechny",
    "hu-HU": "Összes", "sv-SE": "Alla", "no-NO": "Alle", "da-DK": "Alle",
    "fi-FI": "Kaikki", bg: "Всички", sk: "Všetky", sr: "Све",
    hr: "Svi", sl: "Vse", sw: "Zote", af: "Almal",
};

export const guideFilterTranslations = Object.fromEntries(
    Object.entries(allLabels).map(([locale, label]) => [locale, { _guideFilterAll: label }])
);
