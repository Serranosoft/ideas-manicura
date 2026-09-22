const { validateCatalog, MAX_CATALOG_BYTES } = require("../domain/affiliate/catalog-schema");

const CACHE_KEY = "nails.affiliateCatalog.v2";
const TTL_MS = 15 * 60 * 1000;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function validEntry(entry, now) {
    if (!entry
        || !Number.isFinite(entry.fetchedAt)
        || entry.fetchedAt > now
        || now - entry.fetchedAt >= MAX_AGE_MS) return null;

    const catalog = validateCatalog(entry.catalog);
    return catalog ? { catalog, fetchedAt: entry.fetchedAt } : null;
}

function createAffiliateCatalogCache(storage, now = Date.now) {
    return {
        async read() {
            try {
                const raw = await storage.getItem(CACHE_KEY);
                return raw && raw.length <= MAX_CATALOG_BYTES + 200
                    ? validEntry(JSON.parse(raw), now())
                    : null;
            } catch {
                return null;
            }
        },
        async write(entry) {
            const validated = validEntry(entry, now());
            if (!validated) return false;
            try {
                await storage.setItem(CACHE_KEY, JSON.stringify(validated));
                return true;
            } catch {
                return false;
            }
        },
    };
}

module.exports = {
    CACHE_KEY,
    MAX_AGE_MS,
    TTL_MS,
    createAffiliateCatalogCache,
    validEntry,
};
