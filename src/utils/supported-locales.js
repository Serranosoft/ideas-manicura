export const existingLocaleCodes = new Set([
    "es", "en", "ar", "de", "hi", "fr", "id", "pt", "ru", "pl", "vi", "tr", "it", "fa",
]);

const languageDefinitions = [
    { code: "es", name: "Español" },
    { code: "en", name: "English" },
    { code: "ar", name: "العربية" },
    { code: "de", name: "Deutsch" },
    { code: "hi", name: "हिन्दी" },
    { code: "fr", name: "Français" },
    { code: "id", name: "Bahasa Indonesia" },
    { code: "pt", name: "Português" },
    { code: "ru", name: "Русский" },
    { code: "pl", name: "Polski" },
    { code: "vi", name: "Tiếng Việt" },
    { code: "tr", name: "Türkçe" },
    { code: "it", name: "Italiano" },
    { code: "fa", name: "فارسی" },
    { code: "th", name: "ไทย" },
    { code: "bn", name: "বাংলা" },
    { code: "fil", name: "Filipino" },
    { code: "ta", name: "தமிழ்" },
    { code: "te", name: "తెలుగు" },
    { code: "ms", name: "Bahasa Melayu" },
    { code: "ja", name: "日本語" },
    { code: "ko", name: "한국어" },
    { code: "ur", name: "اردو" },
    { code: "zh-TW", name: "繁體中文（台灣）" },
    { code: "uk", name: "Українська" },
    { code: "ro", name: "Română" },
    { code: "nl-NL", name: "Nederlands" },
    { code: "iw-IL", name: "עברית" },
    { code: "zh-CN", name: "简体中文" },
    { code: "zh-HK", name: "繁體中文（香港）" },
    { code: "pt-BR", name: "Português (Brasil)" },
    { code: "pt-PT", name: "Português (Portugal)" },
    { code: "mr-IN", name: "मराठी" },
    { code: "gu", name: "ગુજરાતી" },
    { code: "pa", name: "ਪੰਜਾਬੀ" },
    { code: "ml-IN", name: "മലയാളം" },
    { code: "kn-IN", name: "ಕನ್ನಡ" },
    { code: "ne-NP", name: "नेपाली" },
    { code: "si-LK", name: "සිංහල" },
    { code: "my-MM", name: "မြန်မာ" },
    { code: "km-KH", name: "ខ្មែរ" },
    { code: "el-GR", name: "Ελληνικά" },
    { code: "cs-CZ", name: "Čeština" },
    { code: "hu-HU", name: "Magyar" },
    { code: "sv-SE", name: "Svenska" },
    { code: "no-NO", name: "Norsk" },
    { code: "da-DK", name: "Dansk" },
    { code: "fi-FI", name: "Suomi" },
    { code: "bg", name: "Български" },
    { code: "sk", name: "Slovenčina" },
    { code: "sr", name: "Српски" },
    { code: "hr", name: "Hrvatski" },
    { code: "sl", name: "Slovenščina" },
    { code: "sw", name: "Kiswahili" },
    { code: "af", name: "Afrikaans" },
];

// Language selectors should always use the endonym. It must not depend on the
// current UI locale: an English speaker always sees "English", a Spanish
// speaker "Español", a Japanese speaker "日本語", and so on.
export const supportedLanguages = languageDefinitions.map((language) => ({
    ...language,
    nativeName: language.name,
}));

const localeByLowerCase = new Map(
    supportedLanguages.map(({ code }) => [code.toLowerCase(), code])
);

const preferredLocaleByLanguage = new Map([
    ["he", "iw-IL"],
    ["iw", "iw-IL"],
    ["tl", "fil"],
    ["nb", "no-NO"],
    ["nn", "no-NO"],
    ["nl", "nl-NL"],
    ["mr", "mr-IN"],
    ["ml", "ml-IN"],
    ["kn", "kn-IN"],
    ["ne", "ne-NP"],
    ["si", "si-LK"],
    ["my", "my-MM"],
    ["km", "km-KH"],
    ["el", "el-GR"],
    ["cs", "cs-CZ"],
    ["hu", "hu-HU"],
    ["sv", "sv-SE"],
    ["no", "no-NO"],
    ["da", "da-DK"],
    ["fi", "fi-FI"],
]);

export function normalizeLocale(locale) {
    if (!locale) return "es";

    const normalized = String(locale).replaceAll("_", "-");
    const lower = normalized.toLowerCase();
    const exactMatch = localeByLowerCase.get(lower);
    if (exactMatch) return exactMatch;

    if (lower === "he" || lower.startsWith("he-") || lower === "iw" || lower.startsWith("iw-")) {
        return "iw-IL";
    }
    if (lower === "tl" || lower.startsWith("tl-")) return "fil";
    if (lower === "nb" || lower.startsWith("nb-") || lower === "nn" || lower.startsWith("nn-")) {
        return "no-NO";
    }
    if (lower.startsWith("zh-")) {
        if (lower.includes("hk")) return "zh-HK";
        if (lower.includes("tw") || lower.includes("hant")) return "zh-TW";
        return "zh-CN";
    }
    if (lower.startsWith("pt-br")) return "pt-BR";
    if (lower.startsWith("pt-pt")) return "pt-PT";

    const languageCode = lower.split("-")[0];
    return localeByLowerCase.get(languageCode)
        || preferredLocaleByLanguage.get(languageCode)
        || "es";
}

export function getDeviceLocale(locale) {
    return normalizeLocale(locale?.languageTag || locale?.languageCode);
}
