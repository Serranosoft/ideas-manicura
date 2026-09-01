import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { translations } from "../src/utils/localizations.js";
import { additionalTranslations as currentAdditionalTranslations } from "../src/utils/additional-localizations.js";
import { existingLocaleCodes, supportedLanguages } from "../src/utils/supported-locales.js";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(currentDirectory, "../src/utils/additional-localizations.js");
const additionalLanguages = supportedLanguages.filter(({ code }) => !existingLocaleCodes.has(code));
const refineOnly = process.argv.includes("--refine");
const contextualSource = {
    _frenchTitle: "French manicure",
    _feriaTitle: "Festival",
    _appointmentsTitle: "My manicure appointments",
    _placeSalon: "Nail salon / Place",
    _assignDesign: "Assign nail design to appointment",
    _assignedDesign: "Assigned nail design",
    _scheduleAppointment: "Schedule manicure appointment",
    _placePlaceholder: "e.g. Nail salon, manicure spa...",
    _nailDesigns: "Nail art designs",
    _toastImageSaved: "Image saved in the «Nail art designs» album in your gallery",
    _download: "Download image",
    _homeTitle: "Nail ideas and designs",
    _trendingTitle: "Trending nail designs",
    _designDetail: "Nail design",
    _trendBadge1: "CHROME NAILS",
    _trendTitle1: "Metallic rose gold",
    _trendTitle2: "Minimalist elegance",
    _trendTitle3: "Shine and pearls",
    _trendTitle4: "Spring garden",
    _updateList3: "💅 2 new categories: Aura nail effect and Festival",
    _close: "Dismiss",
    _back: "Go back",
};

const sourceEntries = Object.entries(translations.en)
    .filter(([key]) => !key.startsWith("_designName") && !key.startsWith("_langList"))
    .map(([key, value]) => [key, contextualSource[key] || value]);
const entriesToTranslate = refineOnly
    ? sourceEntries.filter(([key]) => Object.hasOwn(contextualSource, key))
    : sourceEntries;

const targetAliases = {
    fil: "tl",
    "iw-IL": "he",
    "nl-NL": "nl",
    "pt-BR": "pt",
    "pt-PT": "pt-PT",
    "mr-IN": "mr",
    "ml-IN": "ml",
    "kn-IN": "kn",
    "ne-NP": "ne",
    "si-LK": "si",
    "my-MM": "my",
    "km-KH": "km",
    "el-GR": "el",
    "cs-CZ": "cs",
    "hu-HU": "hu",
    "sv-SE": "sv",
    "no-NO": "no",
    "da-DK": "da",
    "fi-FI": "fi",
};

const protectedTokens = new Map([
    ["%{date}", "(((((900001)))))"],
    ["%{time}", "(((((900002)))))"],
    ["%place%", "(((((900003)))))"],
    ["%time%", "(((((900004)))))"],
]);

function protect(value) {
    let result = value;
    for (const [token, replacement] of protectedTokens) result = result.replaceAll(token, replacement);
    return result;
}

function restore(value) {
    let result = value;
    for (const [token, replacement] of protectedTokens) result = result.replaceAll(replacement, token);
    return result.trim();
}

function chunks(values, size) {
    return Array.from({ length: Math.ceil(values.length / size) }, (_, index) =>
        values.slice(index * size, (index + 1) * size)
    );
}

async function requestTranslation(input, target, attempt = 1) {
    const url = new URL("https://translate.googleapis.com/translate_a/single");
    url.search = new URLSearchParams({ client: "gtx", sl: "en", tl: target, dt: "t", q: input });
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (response.status === 429 && attempt < 4) {
        await new Promise((resolvePromise) => setTimeout(resolvePromise, attempt * 2000));
        return requestTranslation(input, target, attempt + 1);
    }
    if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        throw error;
    }
    const payload = await response.json();
    return payload[0].map((part) => part[0]).join("");
}

async function translateChunk(entries, target, attempt = 1) {
    const input = entries
        .map(([, value], index) => `[[[${String(index).padStart(3, "0")}]]] ${protect(value)}`)
        .join("\n");

    try {
        const output = await requestTranslation(input, target);
        const marker = /\[\[\[(\d{3})\]\]\]\s*/g;
        const matches = [...output.matchAll(marker)];
        if (matches.length !== entries.length) {
            throw new Error(`expected ${entries.length} markers, received ${matches.length}`);
        }

        return Object.fromEntries(matches.map((match, index) => {
            const start = match.index + match[0].length;
            const end = matches[index + 1]?.index ?? output.length;
            return [entries[Number(match[1])][0], restore(output.slice(start, end))];
        }));
    } catch (error) {
        if (error.status === 429) throw error;
        if (attempt < 2) {
            await new Promise((resolvePromise) => setTimeout(resolvePromise, 500));
            return translateChunk(entries, target, attempt + 1);
        }
        if (entries.length === 1) {
            const [key, value] = entries[0];
            return { [key]: restore(await requestTranslation(protect(value), target)) };
        }
        const middle = Math.ceil(entries.length / 2);
        const [left, right] = await Promise.all([
            translateChunk(entries.slice(0, middle), target),
            translateChunk(entries.slice(middle), target),
        ]);
        return { ...left, ...right };
    }
}

async function translateLanguage({ code, name }) {
    const target = targetAliases[code] || code;
    const translated = {};
    for (const chunk of chunks(entriesToTranslate, refineOnly ? 30 : 16)) {
        Object.assign(translated, await translateChunk(chunk, target));
    }
    process.stdout.write(`Translated ${name} (${code})\n`);
    return [code, refineOnly
        ? { ...currentAdditionalTranslations[code], ...translated }
        : translated];
}

async function mapWithConcurrency(values, concurrency, mapper) {
    const results = new Array(values.length);
    let nextIndex = 0;
    async function worker() {
        while (nextIndex < values.length) {
            const index = nextIndex++;
            results[index] = await mapper(values[index]);
        }
    }
    await Promise.all(Array.from({ length: concurrency }, worker));
    return results;
}

const packs = Object.fromEntries(await mapWithConcurrency(
    additionalLanguages,
    refineOnly ? 1 : 4,
    translateLanguage
));
const file = `// Generated by scripts/generate-additional-translations.mjs.\n`+
    `// Source language: English. Keep interpolation tokens unchanged.\n`+
    `export const additionalTranslations = ${JSON.stringify(packs, null, 4)};\n`;
await writeFile(outputPath, file, "utf8");
process.stdout.write(`Wrote ${additionalLanguages.length} locales to ${outputPath}\n`);
