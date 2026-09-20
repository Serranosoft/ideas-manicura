import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { supportedLanguages } from "../src/utils/supported-locales.js";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(currentDirectory, "../src/utils/update-localizations.js");

const source = {
    _updateTitle: "🎉 Welcome to the new version!",
    _updateList1: "📖 Learn new manicure designs with step-by-step guides",
    _updateList2: "🧰 Check the materials and detailed instructions before you start",
    _updateList3: "🎬 Watch an ad to unlock each guide for 24 hours",
    _updateList4: "❤️ Open favorites from the header and keep your chosen designs close at hand",
    _updateButton: "Let's explore!",
};

const spanish = {
    _updateTitle: "🎉 ¡Te damos la bienvenida a la nueva versión!",
    _updateList1: "📖 Aprende nuevos diseños con guías paso a paso",
    _updateList2: "🧰 Consulta los materiales y las instrucciones detalladas antes de empezar",
    _updateList3: "🎬 Desbloquea cada guía durante 24 horas viendo un anuncio",
    _updateList4: "❤️ Abre tus favoritos desde la cabecera y ten tus diseños elegidos siempre a mano",
    _updateButton: "¡Vamos allá!",
};

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

async function requestTranslation(input, target, attempt = 1) {
    const url = new URL("https://translate.googleapis.com/translate_a/single");
    url.search = new URLSearchParams({
        client: "gtx",
        sl: "en",
        tl: target,
        dt: "t",
        q: input,
    });
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (response.status === 429 && attempt < 7) {
        await new Promise((resolvePromise) => setTimeout(resolvePromise, attempt * 2500));
        return requestTranslation(input, target, attempt + 1);
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    return payload[0].map((part) => part[0]).join("");
}

async function translateLocale(locale) {
    if (locale === "es") return [locale, spanish];
    if (locale === "en") return [locale, source];

    const entries = Object.entries(source);
    const target = targetAliases[locale] || locale;
    const input = entries
        .map(([, value], index) => `[[[${String(index).padStart(3, "0")}]]] ${value}`)
        .join("\n");
    const output = await requestTranslation(input, target);
    const marker = /\[\[\[(\d{3})\]\]\]\s*/g;
    const matches = [...output.matchAll(marker)];
    if (matches.length !== entries.length) {
        const translatedEntries = [];
        for (const [key, value] of entries) {
            translatedEntries.push([key, (await requestTranslation(value, target)).trim()]);
            await new Promise((resolvePromise) => setTimeout(resolvePromise, 350));
        }
        return [locale, Object.fromEntries(translatedEntries)];
    }
    return [locale, Object.fromEntries(matches.map((match, index) => {
        const start = match.index + match[0].length;
        const end = matches[index + 1]?.index ?? output.length;
        return [entries[Number(match[1])][0], output.slice(start, end).trim()];
    }))];
}

async function mapWithConcurrency(values, concurrency, mapper) {
    const results = new Array(values.length);
    let nextIndex = 0;
    async function worker() {
        while (nextIndex < values.length) {
            const index = nextIndex++;
            results[index] = await mapper(values[index]);
            await new Promise((resolvePromise) => setTimeout(resolvePromise, 350));
        }
    }
    await Promise.all(Array.from({ length: concurrency }, worker));
    return results;
}

const entries = await mapWithConcurrency(
    supportedLanguages.map(({ code }) => code),
    1,
    translateLocale,
);
const file = `// Generated from the latest update copy.\n` +
    `export const updateTranslations = ${JSON.stringify(Object.fromEntries(entries), null, 4)};\n`;
await writeFile(outputPath, file, "utf8");
process.stdout.write(`Wrote update copy for ${entries.length} locales.\n`);
