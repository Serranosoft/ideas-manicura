import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { translations } from "../src/utils/localizations.js";
import { existingLocaleCodes, supportedLanguages } from "../src/utils/supported-locales.js";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const languagesDirectory = resolve(currentDirectory, "../languages");
await mkdir(languagesDirectory, { recursive: true });

const additionalLanguages = supportedLanguages.filter(({ code }) => !existingLocaleCodes.has(code));
await Promise.all(additionalLanguages.map(async ({ code }) => {
    const metadata = {
        android: {
            app_name: translations[code]._homeTitle,
        },
    };
    await writeFile(
        resolve(languagesDirectory, `${code}.json`),
        `${JSON.stringify(metadata, null, 4)}\n`,
        "utf8"
    );
}));

process.stdout.write(`Wrote metadata for ${additionalLanguages.length} locales\n`);
