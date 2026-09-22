const { validateCatalog, isHttpsUrl, MAX_CATALOG_BYTES } = require("../domain/affiliate/catalog-schema");
const { createProductResolver } = require("../domain/affiliate/product-resolver");
const { createAffiliateCatalogCache, validEntry, TTL_MS } = require("../storage/affiliate-catalog-cache");

function createAffiliateCatalogRepository({
    storage,
    url,
    fetchImpl = (...args) => fetch(...args),
    now = Date.now,
    timeoutMs = 5000,
}) {
    const cache = createAffiliateCatalogCache(storage, now);
    let current = null;
    let loading = null;
    let refreshing = null;

    async function initialize() {
        if (!loading) loading = cache.read().then((entry) => { current = entry; });
        await loading;
    }

    function snapshot() {
        const entry = validEntry(current, now());
        return entry ? JSON.parse(JSON.stringify(entry.catalog)) : null;
    }

    async function refresh() {
        await initialize();
        if (refreshing) return refreshing;

        refreshing = (async () => {
            if (!isHttpsUrl(url)) return snapshot();
            const controller = new AbortController();
            let timer;

            try {
                const download = async () => {
                    const response = await fetchImpl(url, {
                        signal: controller.signal,
                        redirect: "error",
                        headers: { Accept: "application/json" },
                    });
                    if (!response.ok
                        || response.redirected
                        || Number(response.headers?.get?.("content-length")) > MAX_CATALOG_BYTES) return null;

                    const text = await response.text();
                    if (text.length > MAX_CATALOG_BYTES) return null;
                    return validateCatalog(JSON.parse(text));
                };

                const catalog = await Promise.race([
                    download(),
                    new Promise((_, reject) => {
                        timer = setTimeout(() => {
                            controller.abort();
                            reject(new Error("Catalog timeout"));
                        }, timeoutMs);
                    }),
                ]);
                const entry = validEntry({ catalog, fetchedAt: now() }, now());
                if (entry) {
                    current = entry;
                    await cache.write(entry);
                }
            } catch {
                // Affiliate failures never block a guide.
            } finally {
                clearTimeout(timer);
            }
            return snapshot();
        })();

        try {
            return await refreshing;
        } finally {
            refreshing = null;
        }
    }

    async function getCatalog() {
        await initialize();
        const catalog = snapshot();
        if (!catalog) return refresh();
        if (now() - current.fetchedAt >= TTL_MS) void refresh();
        return catalog;
    }

    async function getProducts(market) {
        return createProductResolver(await getCatalog()).getProducts(market);
    }

    return {
        getCatalog,
        getProducts,
        getSpainProducts: () => getProducts("spain"),
        refresh,
    };
}

module.exports = { createAffiliateCatalogRepository };
