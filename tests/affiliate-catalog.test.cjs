const assert = require("node:assert/strict");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const test = require("node:test");

const { validateCatalog } = require("../src/domain/affiliate/catalog-schema");
const { AFFILIATE_MARKETS, getAffiliateMarket } = require("../src/domain/affiliate/market");
const { createProductResolver } = require("../src/domain/affiliate/product-resolver");
const { createAffiliateCatalogRepository } = require("../src/services/affiliate-catalog-repository");

const catalogPath = path.join(__dirname, "..", "affiliate-config", "public", "affiliate", "v2", "catalog.json");
const legacyCatalogPath = path.join(__dirname, "..", "affiliate-config", "public", "affiliate", "v1", "catalog.json");
const guidesPath = path.join(__dirname, "..", "src", "utils", "guides-data.js");

async function shippedCatalog() {
    return JSON.parse(await readFile(catalogPath, "utf8"));
}

function memoryStorage() {
    const values = new Map();
    return {
        async getItem(key) { return values.get(key) ?? null; },
        async setItem(key, value) { values.set(key, value); },
    };
}

function jsonResponse(value) {
    return {
        ok: true,
        redirected: false,
        headers: { get: () => null },
        async text() { return JSON.stringify(value); },
    };
}

test("the shipped multi-country catalog passes the mobile validator", async () => {
    const catalog = validateCatalog(await shippedCatalog());
    assert.ok(catalog);
    assert.equal(catalog.enabled, true);
    assert.deepEqual(catalog.supportedMarkets, Object.keys(AFFILIATE_MARKETS));
    assert.equal(Object.keys(catalog.products).length, 19);
});

test("the legacy Spain catalog remains available for already-published clients", async () => {
    const legacyCatalog = JSON.parse(await readFile(legacyCatalogPath, "utf8"));
    assert.equal(legacyCatalog.schemaVersion, 1);
    assert.deepEqual(legacyCatalog.supportedMarkets, ["spain"]);
});

test("device regions map only to their matching Amazon market", () => {
    assert.equal(getAffiliateMarket("ES"), "spain");
    assert.equal(getAffiliateMarket("fr"), "france");
    assert.equal(getAffiliateMarket("DE"), "germany");
    assert.equal(getAffiliateMarket("us"), "united_states");
    assert.equal(getAffiliateMarket("GB"), "united_kingdom");
    assert.equal(getAffiliateMarket("gb"), "united_kingdom");
    assert.equal(AFFILIATE_MARKETS.united_kingdom.affiliateTag, "paulaymanu100-21");
    assert.deepEqual(AFFILIATE_MARKETS.united_kingdom.hosts, ["amazon.co.uk", "www.amazon.co.uk"]);
    assert.equal(getAffiliateMarket("IT"), "italy");
    assert.equal(getAffiliateMarket("PT"), null);
    assert.equal(getAffiliateMarket(undefined), null);
});

test("every guide material references a product in the shipped catalog", async () => {
    const catalog = await shippedCatalog();
    const source = await readFile(guidesPath, "utf8");
    const materialLines = source.split(/\r?\n/).filter((line) => line.includes('material("'));

    assert.ok(materialLines.length > 0);
    for (const line of materialLines) {
        const match = line.match(/,\s*"([a-z][a-z0-9]*(?:_[a-z0-9]+)*)"\),?\s*$/);
        assert.ok(match, `Guide material is missing productId: ${line.trim()}`);
        assert.ok(catalog.products[match[1]], `Unknown guide productId: ${match[1]}`);
    }
});

test("the resolver returns one enabled, highest-priority offer for the requested market", async () => {
    const catalog = await shippedCatalog();
    const product = catalog.products.lampara_uv_led_sunuv;
    product.offers.spain.push({
        retailer: "Amazon España",
        url: "https://www.amazon.es/dp/B08KS4W6L6?tag=paulaymanu113-21",
        enabled: true,
        priority: 200,
    });

    const result = createProductResolver(catalog).getSpainProducts();
    const lamp = result.find((entry) => entry.productId === "lampara_uv_led_sunuv");
    assert.equal(lamp.offer.priority, 200);

    const frenchResult = createProductResolver(catalog).getProducts("france");
    const frenchLamp = frenchResult.find((entry) => entry.productId === "lampara_uv_led_sunuv");
    assert.equal(new URL(frenchLamp.offer.url).hostname, "www.amazon.fr");
});

test("every product has a correctly tagged offer in every supported country", async () => {
    const catalog = await shippedCatalog();
    for (const [productId, product] of Object.entries(catalog.products)) {
        for (const market of catalog.supportedMarkets) {
            const config = AFFILIATE_MARKETS[market];
            const offers = product.offers[market];
            assert.ok(offers?.length, `${productId} is missing ${market}`);
            const url = new URL(offers[0].url);
            assert.ok(config.hosts.includes(url.hostname), `${productId} uses the wrong host for ${market}`);
            assert.equal(url.searchParams.get("tag"), config.affiliateTag, `${productId} uses the wrong tag for ${market}`);
        }
    }
});

test("enabled offers reject wrong Amazon hosts, retailers and affiliate tags", async () => {
    const wrongHost = await shippedCatalog();
    wrongHost.products.lampara_uv_led_sunuv.offers.spain[0].url = "https://example.com/dp/B08KS4W6L6?tag=paulaymanu113-21";
    assert.equal(validateCatalog(wrongHost), null);

    const missingTag = await shippedCatalog();
    missingTag.products.lampara_uv_led_sunuv.offers.france[0].url = "https://www.amazon.fr/s?k=SUNUV+nail+lamp";
    assert.equal(validateCatalog(missingTag), null);

    const crossCountryTag = await shippedCatalog();
    crossCountryTag.products.lampara_uv_led_sunuv.offers.germany[0].url = "https://www.amazon.de/s?k=SUNUV+nail+lamp&tag=paulaymanu105-21";
    assert.equal(validateCatalog(crossCountryTag), null);

    const wrongRetailer = await shippedCatalog();
    wrongRetailer.products.lampara_uv_led_sunuv.offers.united_states[0].retailer = "Amazon España";
    assert.equal(validateCatalog(wrongRetailer), null);
});

test("the repository downloads, validates and caches the catalog", async () => {
    const catalog = await shippedCatalog();
    const storage = memoryStorage();
    let requests = 0;
    const repository = createAffiliateCatalogRepository({
        storage,
        url: "https://catalog.example.test/catalog.json",
        fetchImpl: async () => {
            requests += 1;
            return jsonResponse(catalog);
        },
        now: () => 1_000_000,
    });

    const products = await repository.getProducts("france");
    assert.equal(products.length, 19);
    assert.equal(requests, 1);

    await repository.getProducts("germany");
    assert.equal(requests, 1);
});

test("an invalid refresh never replaces a valid cached catalog", async () => {
    const catalog = await shippedCatalog();
    const storage = memoryStorage();
    let now = 1_000_000;
    let response = catalog;
    const repository = createAffiliateCatalogRepository({
        storage,
        url: "https://catalog.example.test/catalog.json",
        fetchImpl: async () => jsonResponse(response),
        now: () => now,
    });

    assert.equal((await repository.getProducts("united_states")).length, 19);
    now += 16 * 60 * 1000;
    response = { enabled: true };
    const refreshed = await repository.refresh();
    assert.equal(Object.keys(refreshed.products).length, 19);
});
