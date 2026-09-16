const { validateCatalog, MARKETS } = require('./catalog-schema');

function createProductResolver(input) {
    const catalog = validateCatalog(input);

    function getProductsForMarket(market) {
        if (!catalog?.enabled || !MARKETS.includes(market) || !catalog.supportedMarkets.includes(market)) return [];
        return Object.entries(catalog.products).flatMap(([productId, product]) => {
            const offers = [...(product.offers[market] || [])]
                .filter(offer => offer.enabled)
                .sort((left, right) => right.priority - left.priority);
            return offers.length ? [{
                productId,
                product: JSON.parse(JSON.stringify(product)),
                offer: { ...offers[0] },
            }] : [];
        });
    }

    return { getProductsForMarket };
}

module.exports = { createProductResolver };
