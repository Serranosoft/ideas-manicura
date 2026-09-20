const { validateCatalog } = require("./catalog-schema");

function createProductResolver(input) {
    const catalog = validateCatalog(input);

    function getSpainProducts() {
        if (!catalog?.enabled || !catalog.supportedMarkets.includes("spain")) return [];

        return Object.entries(catalog.products).flatMap(([productId, product]) => {
            const offers = [...(product.offers.spain || [])]
                .filter((offer) => offer.enabled)
                .sort((left, right) => right.priority - left.priority);

            return offers.length ? [{
                productId,
                product: JSON.parse(JSON.stringify(product)),
                offer: { ...offers[0] },
            }] : [];
        });
    }

    return { getSpainProducts };
}

module.exports = { createProductResolver };
