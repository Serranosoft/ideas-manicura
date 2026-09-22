import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);
const schema = JSON.parse(readFileSync(new URL('../schema/catalog.schema.json', import.meta.url), 'utf8'));
const validateSchema = ajv.compile(schema);

const AMAZON_MARKETS = {
    spain: {
        retailer: 'Amazon España',
        hosts: new Set(['amazon.es', 'www.amazon.es']),
        affiliateTag: 'paulaymanu113-21',
    },
    france: {
        retailer: 'Amazon France',
        hosts: new Set(['amazon.fr', 'www.amazon.fr']),
        affiliateTag: 'paulaymanu105-21',
    },
    germany: {
        retailer: 'Amazon Deutschland',
        hosts: new Set(['amazon.de', 'www.amazon.de']),
        affiliateTag: 'paulaymanu102-21',
    },
    united_states: {
        retailer: 'Amazon United States',
        hosts: new Set(['amazon.com', 'www.amazon.com']),
        affiliateTag: 'paulaymanu-20',
    },
    united_kingdom: {
        retailer: 'Amazon United Kingdom',
        hosts: new Set(['amazon.co.uk', 'www.amazon.co.uk']),
        affiliateTag: 'paulaymanu100-21',
    },
    italy: {
        retailer: 'Amazon Italia',
        hosts: new Set(['amazon.it', 'www.amazon.it']),
        affiliateTag: 'paulaymanu10d-21',
    },
};

function hasCanonicalAmazonPath(url) {
    return /^\/dp\/[A-Z0-9]{10}\/?$/.test(url.pathname)
        || (url.pathname === '/s' && Boolean(url.searchParams.get('k')?.trim()));
}

export function validateCatalog(catalog) {
    if (!validateSchema(catalog)) {
        return validateSchema.errors.map(error => `${error.instancePath || '/'}: ${error.message} ${JSON.stringify(error.params)}`);
    }
    const errors = [];
    for (const [productId, product] of Object.entries(catalog.products)) {
        for (const [market, offers] of Object.entries(product.offers)) {
            const config = AMAZON_MARKETS[market];
            if (!catalog.supportedMarkets.includes(market)) {
                errors.push(`/products/${productId}/offers/${market}: market must be declared in supportedMarkets`);
            }
            offers.forEach((offer, index) => {
                const field = `/products/${productId}/offers/${market}/${index}`;
                try {
                    const url = new URL(offer.url);
                    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password || url.port || url.hash) {
                        errors.push(`${field}/url: secure HTTPS URL without credentials, port or fragment required`);
                    }
                    if (!config) {
                        errors.push(`${field}: unsupported Amazon market`);
                    } else if (offer.enabled) {
                        if (offer.retailer !== config.retailer) {
                            errors.push(`${field}/retailer: must be ${config.retailer}`);
                        }
                        if (!config.hosts.has(url.hostname.toLowerCase())) {
                            errors.push(`${field}/url: must use the official ${config.retailer} domain`);
                        }
                        if (!hasCanonicalAmazonPath(url)) {
                            errors.push(`${field}/url: canonical Amazon /dp/ASIN or /s?k=... URL required`);
                        }
                        if (url.searchParams.get('tag') !== config.affiliateTag) {
                            errors.push(`${field}/url: Amazon affiliate tag must be ${config.affiliateTag}`);
                        }
                    }
                } catch {
                    errors.push(`${field}/url: invalid URL`);
                }
            });
        }
    }
    return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const path = process.argv[2] ? resolve(process.argv[2]) : new URL('../public/affiliate/v2/catalog.json', import.meta.url);
        const errors = validateCatalog(JSON.parse(readFileSync(path, 'utf8')));
        if (errors.length) {
            console.error(`Invalid catalog:\n${errors.join('\n')}`);
            process.exitCode = 1;
        } else {
            console.log('Affiliate catalog V2 valid.');
        }
    } catch (error) {
        console.error(`Cannot validate catalog: ${error.message}`);
        process.exitCode = 1;
    }
}
