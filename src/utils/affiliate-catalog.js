import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";

const CACHE_PREFIX = "affiliate_catalog_v1";
const CACHE_TTL_MS = 15 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;
const MARKET_IDS = new Set(["spain", "europe", "americas", "east"]);

const EUROPE = new Set("AD AL AT BA BE BG BY CH CY CZ DE DK EE FI FR GB GR HR HU IE IS IT LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SK SM UA VA".split(" "));
const AMERICAS = new Set("AG AI AR AW BB BL BM BO BQ BR BS BZ CA CL CO CR CU CW DM DO EC FK GD GF GL GP GT GY HN HT JM KN KY LC MF MQ MS MX NI PA PE PM PR PY SR SV SX TC TT US UY VC VE VG VI".split(" "));
const EAST = new Set("AE AF AM AZ BD BH BN BT CN GE HK ID IL IN IQ IR JO JP KG KH KP KR KW KZ LA LB LK MM MN MO MV MY NP OM PH PK PS QA SA SG SY TH TJ TL TM TR TW UZ VN YE".split(" "));

export function affiliateMarketFromCountry(countryCode) {
    const country = typeof countryCode === "string" ? countryCode.trim().toUpperCase() : "";
    if (country === "ES") return "spain";
    if (EUROPE.has(country)) return "europe";
    if (AMERICAS.has(country)) return "americas";
    if (EAST.has(country)) return "east";
    return null;
}

function safeHttpUrl(value) {
    if (typeof value !== "string" || !/^https?:\/\//i.test(value) || /[\s\\\u0000-\u001f\u007f]/.test(value)) return null;
    try {
        const url = new URL(value);
        return url.hostname && !url.username && !url.password ? value : null;
    } catch {
        return null;
    }
}

function normalizePayload(value, expectedMarket) {
    if (!value || typeof value !== "object" || value.schemaVersion !== 1 || value.market !== expectedMarket || !Array.isArray(value.products)) {
        throw new Error("Respuesta de catálogo no válida");
    }
    const products = value.products.filter((product) => product && typeof product === "object" && product.active !== false)
        .map((product) => {
            const imageUrl = safeHttpUrl(product.imageUrl);
            const affiliateUrl = safeHttpUrl(product.offer?.url);
            if (!product.id || !product.name || !imageUrl || !affiliateUrl || !product.offer?.store) return null;
            return {
                id: String(product.id),
                name: String(product.name),
                brand: typeof product.brand === "string" ? product.brand : "",
                description: typeof product.description === "string" ? product.description : "",
                category: typeof product.category === "string" ? product.category : "",
                imageUrl,
                priority: Number.isFinite(product.priority) ? product.priority : 0,
                market: expectedMarket,
                offer: {
                    url: affiliateUrl,
                    store: String(product.offer.store),
                    ...(Number.isFinite(product.offer.price) ? { price: product.offer.price } : {}),
                    ...(/^[A-Z]{3}$/.test(product.offer.currency || "") ? { currency: product.offer.currency } : {}),
                },
            };
        }).filter(Boolean);
    return { ...value, market: expectedMarket, products };
}

export async function fetchAffiliateCatalog(options = {}) {
    const baseUrl = process.env.EXPO_PUBLIC_AFFILIATE_CATALOG_URL?.trim();
    if (!baseUrl) throw new Error("EXPO_PUBLIC_AFFILIATE_CATALOG_URL no está configurada");

    const countryCode = options.countryCode || getLocales()[0]?.regionCode || null;
    const market = MARKET_IDS.has(options.market) ? options.market : affiliateMarketFromCountry(countryCode);
    if (!market) return { schemaVersion: 1, updatedAt: null, market: null, products: [], disclosure: "" };

    const cacheKey = `${CACHE_PREFIX}:${market}`;
    let cached = null;
    try {
        cached = JSON.parse(await AsyncStorage.getItem(cacheKey));
        if (!options.forceRefresh && cached?.savedAt && Date.now() - cached.savedAt < CACHE_TTL_MS) {
            return normalizePayload(cached.payload, market);
        }
    } catch {
        cached = null;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        const url = new URL(baseUrl);
        url.searchParams.set("market", market);
        const response = await fetch(url.toString(), { signal: controller.signal, headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`El catálogo respondió con HTTP ${response.status}`);
        const payload = normalizePayload(await response.json(), market);
        await AsyncStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), payload }));
        return payload;
    } catch (error) {
        if (cached?.payload) return normalizePayload(cached.payload, market);
        throw error;
    } finally {
        clearTimeout(timer);
    }
}
