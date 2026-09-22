const { AFFILIATE_MARKETS } = require("./market");

const MAX_CATALOG_BYTES = 1024 * 1024;
const CATALOG_SCHEMA_VERSION = 2;
const AMAZON_ES_AFFILIATE_TAG = AFFILIATE_MARKETS.spain.affiliateTag;

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const hasOnlyKeys = (value, allowed) => Object.keys(value).every((key) => allowed.includes(key));
const isId = (value) => typeof value === "string"
    && /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/.test(value)
    && value.length <= 100;
const isText = (value, maxLength) => typeof value === "string"
    && Boolean(value.trim())
    && value.length <= maxLength;

function isHttpsUrl(value) {
    try {
        const url = new URL(value);
        return typeof value === "string"
            && value.length <= 2048
            && url.protocol === "https:"
            && Boolean(url.hostname)
            && !url.username
            && !url.password
            && !url.port;
    } catch {
        return false;
    }
}

function hasCanonicalAmazonPath(url) {
    return /^\/dp\/[A-Z0-9]{10}\/?$/.test(url.pathname)
        || (url.pathname === "/s" && isText(url.searchParams.get("k"), 300));
}

function isAllowedAmazonOffer(market, offer) {
    try {
        const config = AFFILIATE_MARKETS[market];
        const url = new URL(offer.url);
        return Boolean(config)
            && offer.retailer === config.retailer
            && config.hosts.includes(url.hostname.toLowerCase())
            && hasCanonicalAmazonPath(url)
            && url.searchParams.get("tag") === config.affiliateTag
            && !url.hash;
    } catch {
        return false;
    }
}

function validateCatalog(value) {
    try {
        if (!isObject(value)
            || JSON.stringify(value).length > MAX_CATALOG_BYTES
            || !hasOnlyKeys(value, ["schemaVersion", "enabled", "updatedAt", "supportedMarkets", "products"])
            || value.schemaVersion !== CATALOG_SCHEMA_VERSION
            || typeof value.enabled !== "boolean") return null;

        if (typeof value.updatedAt !== "string"
            || !Number.isFinite(Date.parse(value.updatedAt))) return null;
        if (!Array.isArray(value.supportedMarkets)
            || value.supportedMarkets.some((market) => !AFFILIATE_MARKETS[market])
            || new Set(value.supportedMarkets).size !== value.supportedMarkets.length) return null;
        if (!isObject(value.products) || Object.keys(value.products).length > 2000) return null;

        for (const [productId, product] of Object.entries(value.products)) {
            if (!isId(productId)
                || !isObject(product)
                || !hasOnlyKeys(product, ["displayName", "brand", "category", "description", "imageUrl", "offers"])
                || !isText(product.displayName, 200)
                || !isId(product.category)
                || !isObject(product.offers)
                || (product.brand !== undefined && (typeof product.brand !== "string" || product.brand.length > 120))
                || (product.description !== undefined && (typeof product.description !== "string" || product.description.length > 600))
                || (product.imageUrl !== undefined && !isHttpsUrl(product.imageUrl))) return null;

            if (!hasOnlyKeys(product.offers, Object.keys(AFFILIATE_MARKETS))) return null;
            for (const [market, offers] of Object.entries(product.offers)) {
                if (!value.supportedMarkets.includes(market)
                    || !Array.isArray(offers)
                    || offers.length > 20) return null;

                for (const offer of offers) {
                    if (!isObject(offer)
                        || !hasOnlyKeys(offer, ["retailer", "url", "enabled", "priority"])
                        || !isText(offer.retailer, 80)
                        || !isHttpsUrl(offer.url)
                        || typeof offer.enabled !== "boolean"
                        || !Number.isInteger(offer.priority)
                        || offer.priority < 0
                        || offer.priority > 2147483647
                        || (offer.enabled && !isAllowedAmazonOffer(market, offer))) return null;
                }
            }
        }

        return JSON.parse(JSON.stringify(value));
    } catch {
        return null;
    }
}

module.exports = {
    AMAZON_ES_AFFILIATE_TAG,
    CATALOG_SCHEMA_VERSION,
    MAX_CATALOG_BYTES,
    isAllowedAmazonOffer,
    isHttpsUrl,
    validateCatalog,
};
