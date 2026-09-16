import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { catalogSchema, marketFromCountry, productsForMarket, slugifyProductId } from "./catalog";

const product = {
  id: "esmalte-rojo",
  name: "Esmalte rojo",
  brand: "Marca",
  description: "",
  category: "Esmaltes",
  imageUrl: "https://example.com/esmalte.jpg",
  active: true,
  priority: 2,
  offers: {
    spain: { url: "https://example.com/es", store: "Tienda ES", price: 8.5, currency: "EUR" },
    americas: { url: "https://example.com/us", store: "Tienda US" },
  },
};

describe("affiliate catalog", () => {
  it("maps countries to the requested commercial segments", () => {
    assert.equal(marketFromCountry("ES"), "spain");
    assert.equal(marketFromCountry("DE"), "europe");
    assert.equal(marketFromCountry("mx"), "americas");
    assert.equal(marketFromCountry("AE"), "east");
    assert.equal(marketFromCountry("JP"), "east");
    assert.equal(marketFromCountry("AU"), null);
  });

  it("only exposes active products with an offer for the market", () => {
    const catalog = catalogSchema.parse({ schemaVersion: 1, updatedAt: new Date().toISOString(), products: [product] });
    assert.equal(productsForMarket(catalog, "spain").length, 1);
    assert.deepEqual(productsForMarket(catalog, "europe"), []);
  });

  it("rejects duplicate ids and unsafe protocols", () => {
    assert.equal(catalogSchema.safeParse({ schemaVersion: 1, updatedAt: new Date().toISOString(), products: [product, product] }).success, false);
    assert.equal(catalogSchema.safeParse({ schemaVersion: 1, updatedAt: new Date().toISOString(), products: [{ ...product, imageUrl: "javascript:alert(1)" }] }).success, false);
  });

  it("creates stable ids from product names", () => {
    assert.equal(slugifyProductId("Lámpara UV / LED Pro"), "lampara-uv-led-pro");
  });
});
