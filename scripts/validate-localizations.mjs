import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { translations } from "../src/utils/localizations.js";
import { reviewedTranslationOverrides } from "../src/utils/reviewed-localization-overrides.js";
import { existingLocaleCodes, normalizeLocale, supportedLanguages } from "../src/utils/supported-locales.js";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const appConfig = JSON.parse(await readFile(resolve(currentDirectory, "../app.json"), "utf8"));
const expectedCodes = supportedLanguages.map(({ code }) => code);
const translationCodes = Object.keys(translations);
const errors = [];
const additionalCodes = expectedCodes.filter((code) => !existingLocaleCodes.has(code));

for (const language of supportedLanguages) {
    if (!String(language.nativeName ?? "").trim()) {
        errors.push(`Missing native language name: ${language.code}`);
    }
    if (language.nativeName !== language.name) {
        errors.push(`Language selector name is not the endonym: ${language.code}`);
    }
}

for (const code of expectedCodes) {
    if (!translationCodes.includes(code)) errors.push(`Missing translation pack: ${code}`);
}

const humanReviewedKeys = [
    "_frenchTitle", "_feriaTitle", "_appointmentsTitle", "_scheduleAppointment",
    "_toastImageSaved", "_designDetail", "_updateList3", "_reminderNotificationTitle",
];
for (const code of additionalCodes) {
    const reviewedPack = reviewedTranslationOverrides[code];
    if (!reviewedPack) {
        errors.push(`Missing human-reviewed overrides: ${code}`);
        continue;
    }
    for (const key of humanReviewedKeys) {
        if (!String(reviewedPack[key] ?? "").trim()) {
            errors.push(`${code} is missing human review for ${key}`);
        }
    }
}

const knownMachineTranslationFailures =
    /Aura Effect|\bFair\b|My Nail|Book Appointment|Nail Designs|Nails Studio|Spring Garden|CHROME DREAMS|Shine & Pearls|Minimalist Chic|ETHEREAL CRYSTALS/i;
const localeSpecificFailures = {
    bn: /পেরেক|নিয়োগ/,
    ta: /ஆணி|நியமன/,
    te: /నియామక/,
    ur: /کیل/,
    sw: /msumari|misumari|uteuzi/i,
    af: /spyker|aanstelling/i,
    "sv-SE": /spik|möte|utnäm/i,
    "no-NO": /spiker/i,
    "da-DK": /søm/i,
    uk: /зустріч|призначен/i,
    ro: /numir|întâln/i,
    "iw-IL": /מינוי|פגיש/,
    "hu-HU": /találkoz|kinevez/i,
    bg: /срещ/i,
    ja: /予定/,
    ko: /약속/,
    "zh-TW": /約會/,
    "zh-CN": /约会/,
    "zh-HK": /約會/,
    "cs-CZ": /schůzk/i,
    sk: /stretnut/i,
    sr: /састан/i,
    hr: /sastan/i,
    sl: /sestank/i,
    "fi-FI": /tapaamis/i,
};
const acceptedInternationalTerms = new Set([
    "_babyboomerTitle", "_coquetteTitle", "_aestheticTitle", "_animalprintTitle",
    "_halloweenTitle", "_3dTitle",
]);
for (const code of additionalCodes) {
    for (const [key, value] of Object.entries(translations[code] || {})) {
        if (knownMachineTranslationFailures.test(value)) {
            errors.push(`${code}.${key} contains an unreviewed English phrase`);
        }
        if (localeSpecificFailures[code]?.test(value)) {
            errors.push(`${code}.${key} contains a known false-sense translation`);
        }
        if (
            !acceptedInternationalTerms.has(key)
            && translations.en[key]
            && String(value).toLocaleLowerCase() === String(translations.en[key]).toLocaleLowerCase()
        ) {
            errors.push(`${code}.${key} was left untranslated`);
        }
    }
}
for (const code of translationCodes) {
    if (!expectedCodes.includes(code)) errors.push(`Translation pack is not selectable: ${code}`);
}

const requiredKeys = Object.keys(translations.en).filter((key) => !key.startsWith("_langList"));
const interpolationTokens = (value) => [...String(value).matchAll(/%\{[^}]+\}|%[^%\s]+%/g)]
    .map(([token]) => token)
    .sort();

for (const code of expectedCodes) {
    const pack = translations[code];
    if (!pack) continue;
    for (const key of requiredKeys) {
        if (!String(pack[key] ?? "").trim()) {
            errors.push(`${code} is missing ${key}`);
            continue;
        }
        const expectedTokens = interpolationTokens(translations.en[key]);
        const actualTokens = interpolationTokens(pack[key]);
        if (expectedTokens.join("|") !== actualTokens.join("|")) {
            errors.push(`${code}.${key} has invalid interpolation tokens`);
        }
    }
}

const defaultLocaleWithoutMetadata = "es";
for (const code of expectedCodes.filter((code) => code !== defaultLocaleWithoutMetadata)) {
    const metadataEntry = Object.entries(appConfig.expo.locales || {})
        .find(([configuredCode]) => normalizeLocale(configuredCode) === code);
    const metadataPath = metadataEntry?.[1];
    if (!metadataPath) {
        errors.push(`Missing Expo locale metadata entry: ${code}`);
        continue;
    }
    const absoluteMetadataPath = resolve(currentDirectory, "..", metadataPath);
    const metadata = JSON.parse(await readFile(absoluteMetadataPath, "utf8"));
    if (!metadata.android?.app_name) errors.push(`Missing Android app_name: ${code}`);
    if (!metadata.ios?.CFBundleDisplayName) {
        errors.push(`Missing iOS CFBundleDisplayName: ${code}`);
    }
}

const normalizationCases = {
    "he-IL": "iw-IL",
    "iw_IL": "iw-IL",
    "tl-PH": "fil",
    "zh-Hant-HK": "zh-HK",
    "zh-Hant-TW": "zh-TW",
    "zh-Hans-CN": "zh-CN",
    "pt-BR": "pt-BR",
    "pt-PT": "pt-PT",
    "nl-BE": "nl-NL",
    "nb-NO": "no-NO",
    "mr": "mr-IN",
};
for (const [input, expected] of Object.entries(normalizationCases)) {
    const actual = normalizeLocale(input);
    if (actual !== expected) errors.push(`normalizeLocale(${input}) returned ${actual}, expected ${expected}`);
}

if (errors.length) {
    process.stderr.write(`${errors.join("\n")}\n`);
    process.exitCode = 1;
} else {
    process.stdout.write(
        `Validated ${expectedCodes.length} locales, ${requiredKeys.length} keys per locale, metadata and aliases.\n`
    );
}
