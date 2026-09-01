import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { translations } from "../src/utils/localizations.js";
import { normalizeLocale } from "../src/utils/supported-locales.js";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const languagesDirectory = resolve(currentDirectory, "../languages");
await mkdir(languagesDirectory, { recursive: true });

const appConfig = JSON.parse(
    await readFile(resolve(currentDirectory, "../app.json"), "utf8")
);
const configuredLocales = Object.entries(appConfig.expo.locales);

await Promise.all(configuredLocales.map(async ([code, metadataPath]) => {
    const translationCode = normalizeLocale(code);
    const absoluteMetadataPath = resolve(currentDirectory, "..", metadataPath);
    let currentMetadata = {};
    try {
        currentMetadata = JSON.parse(await readFile(absoluteMetadataPath, "utf8"));
    } catch {
        // A missing file is created from the in-app translation below.
    }
    const appName = currentMetadata.android?.app_name
        || translations[translationCode]._homeTitle;
    const metadata = {
        android: {
            app_name: appName,
        },
        ios: {
            CFBundleDisplayName: appName,
        },
    };
    await writeFile(
        absoluteMetadataPath,
        `${JSON.stringify(metadata, null, 4)}\n`,
        "utf8"
    );
}));

process.stdout.write(`Wrote Android and iOS metadata for ${configuredLocales.length} locales\n`);
