const AFFILIATE_MARKETS = Object.freeze({
    spain: Object.freeze({
        regionCode: "ES",
        retailer: "Amazon España",
        hosts: Object.freeze(["amazon.es", "www.amazon.es"]),
        affiliateTag: "paulaymanu113-21",
    }),
    france: Object.freeze({
        regionCode: "FR",
        retailer: "Amazon France",
        hosts: Object.freeze(["amazon.fr", "www.amazon.fr"]),
        affiliateTag: "paulaymanu105-21",
    }),
    germany: Object.freeze({
        regionCode: "DE",
        retailer: "Amazon Deutschland",
        hosts: Object.freeze(["amazon.de", "www.amazon.de"]),
        affiliateTag: "paulaymanu102-21",
    }),
    united_states: Object.freeze({
        regionCode: "US",
        retailer: "Amazon United States",
        hosts: Object.freeze(["amazon.com", "www.amazon.com"]),
        affiliateTag: "paulaymanu-20",
    }),
    united_kingdom: Object.freeze({
        regionCode: "GB",
        retailer: "Amazon United Kingdom",
        hosts: Object.freeze(["amazon.co.uk", "www.amazon.co.uk"]),
        affiliateTag: "paulaymanu100-21",
    }),
    italy: Object.freeze({
        regionCode: "IT",
        retailer: "Amazon Italia",
        hosts: Object.freeze(["amazon.it", "www.amazon.it"]),
        affiliateTag: "paulaymanu10d-21",
    }),
});

const MARKET_BY_REGION = new Map(
    Object.entries(AFFILIATE_MARKETS).map(([market, config]) => [config.regionCode, market]),
);

function getAffiliateMarket(regionCode) {
    if (typeof regionCode !== "string") return null;
    return MARKET_BY_REGION.get(regionCode.trim().toUpperCase()) || null;
}

function isAffiliateRegion(regionCode) {
    return getAffiliateMarket(regionCode) !== null;
}

function isSpainRegion(regionCode) {
    return getAffiliateMarket(regionCode) === "spain";
}

module.exports = {
    AFFILIATE_MARKETS,
    getAffiliateMarket,
    isAffiliateRegion,
    isSpainRegion,
};
