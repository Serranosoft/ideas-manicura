const assert = require("node:assert/strict");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const test = require("node:test");

const { validateCatalog } = require("../src/domain/affiliate/catalog-schema");
const { isSpainRegion } = require("../src/domain/affiliate/market");
const { createProductResolver } = require("../src/domain/affiliate/product-resolver");
const { createAffiliateCatalogRepository } = require("../src/services/affiliate-catalog-repository");

const catalogPath = path.join(__dirname, "..", "affiliate-config", "public", "affiliate", "v1", "catalog.json");
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

test("the shipped Spain catalog passes the mobile validator", async () => {
    const catalog = validateCatalog(await shippedCatalog());
    assert.ok(catalog);
    assert.equal(catalog.enabled, true);
    assert.deepEqual(catalog.supportedMarkets, ["spain"]);
    assert.equal(Object.keys(catalog.products).length, 19);
});

test("affiliate availability is restricted to Spain region codes", () => {
    assert.equal(isSpainRegion("ES"), true);
    assert.equal(isSpainRegion("es"), true);
    assert.equal(isSpainRegion("PT"), false);
    assert.equal(isSpainRegion(undefined), false);
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

test("the resolver returns one enabled, highest-priority Spain offer per product", async () => {
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
});

test("enabled offers reject non-Amazon hosts and missing affiliate tags", async () => {
    const wrongHost = await shippedCatalog();
    wrongHost.products.lampara_uv_led_sunuv.offers.spain[0].url = "https://example.com/dp/B08KS4W6L6?tag=paulaymanu113-21";
    assert.equal(validateCatalog(wrongHost), null);

    const missingTag = await shippedCatalog();
    missingTag.products.lampara_uv_led_sunuv.offers.spain[0].url = "https://www.amazon.es/dp/B08KS4W6L6";
    assert.equal(validateCatalog(missingTag), null);
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

    const products = await repository.getSpainProducts();
    assert.equal(products.length, 19);
    assert.equal(requests, 1);

    await repository.getSpainProducts();
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

    assert.equal((await repository.getSpainProducts()).length, 19);
    now += 16 * 60 * 1000;
    response = { enabled: true };
    const refreshed = await repository.refresh();
    assert.equal(Object.keys(refreshed.products).length, 19);
});
