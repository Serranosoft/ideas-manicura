const MAX_CATALOG_BYTES = 1024 * 1024;
const MARKETS = ['spain', 'europe', 'americas', 'east'];
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const id = value => typeof value === 'string' && /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/.test(value) && value.length <= 100;
const keys = (value, allowed) => Object.keys(value).every(key => allowed.includes(key));
const text = (value, max) => typeof value === 'string' && value.trim() && value.length <= max;

function isHttpsUrl(value) {
    try {
        const url = new URL(value);
        return typeof value === 'string' && value.length <= 2048 && url.protocol === 'https:'
            && Boolean(url.hostname) && !url.username && !url.password && !url.port;
    } catch {
        return false;
    }
}

function validateCatalog(value) {
    try {
        if (!object(value) || JSON.stringify(value).length > MAX_CATALOG_BYTES
            || !keys(value, ['schemaVersion', 'enabled', 'updatedAt', 'supportedMarkets', 'products'])
            || value.schemaVersion !== 1 || typeof value.enabled !== 'boolean') return null;
        if (typeof value.updatedAt !== 'string'
            || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value.updatedAt)
            || !Number.isFinite(Date.parse(value.updatedAt))) return null;
        if (!Array.isArray(value.supportedMarkets)
            || value.supportedMarkets.some(market => !MARKETS.includes(market))
            || new Set(value.supportedMarkets).size !== value.supportedMarkets.length) return null;
        if (!object(value.products) || Object.keys(value.products).length > 2000) return null;

        for (const [productId, product] of Object.entries(value.products)) {
            if (!id(productId) || !object(product)
                || !keys(product, ['displayName', 'brand', 'category', 'description', 'imageUrl', 'offers'])
                || !text(product.displayName, 200) || !id(product.category)
                || (product.imageUrl !== undefined && !isHttpsUrl(product.imageUrl))
                || (product.brand !== undefined && (typeof product.brand !== 'string' || product.brand.length > 120))
                || (product.description !== undefined && (typeof product.description !== 'string' || product.description.length > 600))
                || !object(product.offers)) return null;

            for (const [market, offers] of Object.entries(product.offers)) {
                if (!value.supportedMarkets.includes(market) || !Array.isArray(offers) || offers.length > 20) return null;
                for (const offer of offers) {
                    if (!object(offer) || !keys(offer, ['retailer', 'url', 'enabled', 'priority'])
                        || !text(offer.retailer, 80) || !isHttpsUrl(offer.url)
                        || typeof offer.enabled !== 'boolean' || !Number.isInteger(offer.priority)
                        || offer.priority < 0 || offer.priority > 2147483647) return null;
                    const host = new URL(offer.url).hostname.toLowerCase().replace(/\.$/, '');
                    if (offer.enabled && (host === 'invalid' || host.endsWith('.invalid'))) return null;
                }
            }
        }
        return JSON.parse(JSON.stringify(value));
    } catch {
        return null;
    }
}

module.exports = { validateCatalog, isHttpsUrl, MAX_CATALOG_BYTES, MARKETS };
