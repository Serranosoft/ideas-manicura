import { z } from "zod";

export const MARKET_IDS = ["spain", "europe", "americas", "east"] as const;
export type MarketId = (typeof MARKET_IDS)[number];

export const MARKET_LABELS: Record<MarketId, string> = {
  spain: "España",
  europe: "Europa",
  americas: "América",
  east: "Oriente",
};

const httpUrl = z.url().refine((value) => {
  const url = new URL(value);
  return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password;
}, "Debe ser una URL HTTP/HTTPS completa y sin credenciales");

export const offerSchema = z.object({
  url: httpUrl,
  store: z.string().trim().min(1).max(100),
  price: z.number().nonnegative().finite().optional(),
  currency: z.string().trim().regex(/^[A-Z]{3}$/, "Usa un código ISO de 3 letras").optional(),
});

export const productSchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9][a-z0-9-]{0,79}$/, "Usa minúsculas, números y guiones"),
  name: z.string().trim().min(1).max(160),
  brand: z.string().trim().max(100).default(""),
  description: z.string().trim().max(500).default(""),
  category: z.string().trim().min(1).max(80),
  imageUrl: httpUrl,
  active: z.boolean().default(true),
  priority: z.number().int().min(0).max(9999).default(0),
  offers: z.object({
    spain: offerSchema.optional(),
    europe: offerSchema.optional(),
    americas: offerSchema.optional(),
    east: offerSchema.optional(),
  }).refine((offers) => Object.values(offers).some(Boolean), "Añade al menos un enlace regional"),
});

export const catalogSchema = z.object({
  schemaVersion: z.literal(1),
  updatedAt: z.iso.datetime(),
  products: z.array(productSchema).max(2000),
}).superRefine((catalog, context) => {
  const ids = new Set<string>();
  catalog.products.forEach((product, index) => {
    if (ids.has(product.id)) {
      context.addIssue({
        code: "custom",
        path: ["products", index, "id"],
        message: `El id ${product.id} está repetido`,
      });
    }
    ids.add(product.id);
  });
});

export type Offer = z.infer<typeof offerSchema>;
export type Product = z.infer<typeof productSchema>;
export type Catalog = z.infer<typeof catalogSchema>;

const EUROPE = new Set("AD AL AT BA BE BG BY CH CY CZ DE DK EE FI FR GB GR HR HU IE IS IT LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SK SM UA VA".split(" "));
const AMERICAS = new Set("AG AI AR AW BB BL BM BO BQ BR BS BZ CA CL CO CR CU CW DM DO EC FK GD GF GL GP GT GY HN HT JM KN KY LC MF MQ MS MX NI PA PE PM PR PY SR SV SX TC TT US UY VC VE VG VI".split(" "));
const EAST = new Set("AE AF AM AZ BD BH BN BT CN GE HK ID IL IN IQ IR JO JP KG KH KP KR KW KZ LA LB LK MM MN MO MV MY NP OM PH PK PS QA SA SG SY TH TJ TL TM TR TW UZ VN YE".split(" "));

export function marketFromCountry(countryCode?: string | null): MarketId | null {
  const country = countryCode?.trim().toUpperCase();
  if (!country || !/^[A-Z]{2}$/.test(country)) return null;
  if (country === "ES") return "spain";
  if (EUROPE.has(country)) return "europe";
  if (AMERICAS.has(country)) return "americas";
  if (EAST.has(country)) return "east";
  return null;
}

export function parseMarket(value?: string | null): MarketId | null {
  return MARKET_IDS.includes(value as MarketId) ? value as MarketId : null;
}

export function productsForMarket(catalog: Catalog, market: MarketId) {
  return catalog.products
    .filter((product) => product.active && product.offers[market])
    .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name, "es"))
    .map(({ offers, ...product }) => ({ ...product, market, offer: offers[market]! }));
}

export function slugifyProductId(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}
