import { type NextRequest, NextResponse } from "next/server";
import { MARKET_LABELS, marketFromCountry, parseMarket, productsForMarket } from "@/lib/catalog";
import { loadCatalog } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const requestedMarket = parseMarket(request.nextUrl.searchParams.get("market"));
    const country = request.nextUrl.searchParams.get("country");
    const market = requestedMarket ?? marketFromCountry(country);
    if (!market) {
      return NextResponse.json({
        error: "Indica market=spain|europe|americas|east o un country ISO compatible.",
      }, { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
    }

    const { catalog, revision } = await loadCatalog();
    return NextResponse.json({
      schemaVersion: catalog.schemaVersion,
      updatedAt: catalog.updatedAt,
      market,
      marketLabel: MARKET_LABELS[market],
      disclosure: "Algunos enlaces son de afiliado. Podemos recibir una comisión si compras, sin coste adicional para ti.",
      products: productsForMarket(catalog, market),
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        ETag: `\"${revision.replaceAll('"', "")}\"`,
      },
    });
  } catch (error) {
    console.error("catalog_read_failed", error);
    return NextResponse.json({ error: "El catálogo no está disponible temporalmente." }, { status: 503 });
  }
}
