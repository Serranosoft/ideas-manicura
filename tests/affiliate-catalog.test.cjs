const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { validateCatalog } = require('../src/domain/affiliate/catalog-schema');
const { resolveAffiliateMarket } = require('../src/domain/affiliate/market');
const { createProductResolver } = require('../src/domain/affiliate/product-resolver');
const { createAffiliateCatalogRepository } = require('../src/services/affiliate-catalog-repository');
const { CACHE_KEY, TTL_MS } = require('../src/storage/affiliate-catalog-cache');

const now = 1800000000000;
const offer = (url, priority = 100) => ({ retailer: 'Tienda', url, enabled: true, priority });
function fixture() {
    return {
        schemaVersion: 1,
        enabled: true,
        updatedAt: '2026-09-16T00:00:00Z',
        supportedMarkets: ['spain', 'europe', 'americas', 'east'],
        products: {
            lamp: {
                displayName: 'Lámpara UV',
                brand: 'Marca',
                category: 'lamparas',
                offers: {
                    spain: [offer('https://shop.example.com/es')],
                    europe: [offer('https://shop.example.com/eu')],
                },
            },
        },
    };
}

test('the shipped empty catalog is valid and disabled', () => {
    const catalog = require('../affiliate-config/public/affiliate/v1/catalog.json');
    assert.ok(validateCatalog(catalog));
    assert.equal(catalog.enabled, false);
    assert.deepEqual(catalog.products, {});
});

test('market resolver separates Spain, Europe, Americas and East', () => {
    assert.equal(resolveAffiliateMarket('ES'), 'spain');
    assert.equal(resolveAffiliateMarket('DE'), 'europe');
    assert.equal(resolveAffiliateMarket('MX'), 'americas');
    assert.equal(resolveAffiliateMarket('JP'), 'east');
    assert.equal(resolveAffiliateMarket('AU'), null);
});

test('resolver returns only the exact market and highest enabled priority', () => {
    const catalog = fixture();
    catalog.products.lamp.offers.spain.push(offer('https://shop.example.com/best', 200));
    const resolver = createProductResolver(catalog);
    assert.equal(resolver.getProductsForMarket('spain')[0].offer.url, 'https://shop.example.com/best');
    assert.equal(resolver.getProductsForMarket('americas').length, 0);
    assert.equal(resolver.getProductsForMarket('unknown').length, 0);
});

test('invalid or unsafe catalogs fail closed', () => {
    for (const url of ['http://shop.example.com/a', 'javascript:alert(1)', 'https://user:pass@shop.example.com/a']) {
        const catalog = fixture();
        catalog.products.lamp.offers.spain[0].url = url;
        assert.equal(validateCatalog(catalog), null);
    }
    const extra = fixture();
    extra.unexpected = true;
    assert.equal(validateCatalog(extra), null);
});

test('repository downloads and caches a valid catalog', async () => {
    let saved = null;
    const storage = {
        getItem: async key => { assert.equal(key, CACHE_KEY); return saved; },
        setItem: async (key, value) => { assert.equal(key, CACHE_KEY); saved = value; },
    };
    const repository = createAffiliateCatalogRepository({
        storage,
        url: 'https://catalog.example.com/affiliate/v1/catalog.json',
        now: () => now,
        fetchImpl: async () => ({ ok: true, redirected: false, headers: { get: () => null }, text: async () => JSON.stringify(fixture()) }),
    });
    assert.equal((await repository.getProductsForMarket('spain')).length, 1);
    assert.ok(saved);
});

test('invalid refresh preserves a usable cached catalog', async () => {
    const cached = JSON.stringify({ catalog: fixture(), fetchedAt: now - TTL_MS - 1 });
    const storage = { getItem: async () => cached, setItem: async () => { throw new Error('must not overwrite'); } };
    const repository = createAffiliateCatalogRepository({
        storage,
        url: 'https://catalog.example.com/affiliate/v1/catalog.json',
        now: () => now,
        fetchImpl: async () => ({ ok: true, redirected: false, headers: { get: () => null }, text: async () => '{}' }),
    });
    assert.equal((await repository.getProductsForMarket('spain')).length, 1);
    await repository.refresh();
    assert.equal((await repository.getProductsForMarket('spain')).length, 1);
});

test('standalone validator stays identical to the mobile runtime', () => {
    assert.equal(
        fs.readFileSync('src/domain/affiliate/catalog-schema.js', 'utf8'),
        fs.readFileSync('affiliate-config/schema/mobile-validator.cjs', 'utf8'),
    );
});
