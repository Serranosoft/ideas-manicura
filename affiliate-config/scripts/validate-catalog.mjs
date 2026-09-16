import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import mobileValidator from '../schema/mobile-validator.cjs';

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);
const schema = JSON.parse(readFileSync(new URL('../schema/catalog.schema.json', import.meta.url), 'utf8'));
const validateSchema = ajv.compile(schema);

export function validateCatalog(catalog) {
    if (!validateSchema(catalog)) {
        return validateSchema.errors.map(error => `${error.instancePath || '/'}: ${error.message} ${JSON.stringify(error.params)}`);
    }
    const errors = [];
    for (const [productId, product] of Object.entries(catalog.products)) {
        for (const [market, offers] of Object.entries(product.offers)) {
            if (!catalog.supportedMarkets.includes(market)) {
                errors.push(`/products/${productId}/offers/${market}: market must be declared in supportedMarkets`);
            }
            offers.forEach((offer, index) => {
                try {
                    const url = new URL(offer.url);
                    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password || url.port) {
                        errors.push(`/products/${productId}/offers/${market}/${index}/url: secure HTTPS URL required`);
                    }
                } catch {
                    errors.push(`/products/${productId}/offers/${market}/${index}/url: invalid URL`);
                }
            });
        }
    }
    if (!mobileValidator.validateCatalog(catalog)) errors.push('Catalog incompatible with the mobile runtime validator');
    return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const path = process.argv[2] ? resolve(process.argv[2]) : new URL('../public/affiliate/v1/catalog.json', import.meta.url);
        const errors = validateCatalog(JSON.parse(readFileSync(path, 'utf8')));
        if (errors.length) {
            console.error(`Invalid catalog:\n${errors.join('\n')}`);
            process.exitCode = 1;
        } else {
            console.log('Affiliate catalog V1 valid.');
        }
    } catch (error) {
        console.error(`Cannot validate catalog: ${error.message}`);
        process.exitCode = 1;
    }
}
