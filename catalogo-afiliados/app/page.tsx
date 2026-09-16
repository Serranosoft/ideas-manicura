import { MARKET_IDS, MARKET_LABELS, type MarketId, parseMarket, productsForMarket } from "@/lib/catalog";
import { loadCatalog } from "@/lib/storage";

export const dynamic = "force-dynamic";

function formatPrice(price?: number, currency?: string) {
  if (price === undefined) return null;
  try {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: currency || "EUR" }).format(price);
  } catch {
    return `${price} ${currency || ""}`.trim();
  }
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ market?: string }> }) {
  const market = parseMarket((await searchParams).market) ?? "spain";
  const { catalog } = await loadCatalog();
  const products = productsForMarket(catalog, market);

  return (
    <main className="shell">
      <header className="site-header">
        <a className="brand" href="/">Ideas de manicura</a>
        <a className="admin-link" href="/admin">Administrar</a>
      </header>
      <section className="hero">
        <p className="eyebrow">Selección recomendada</p>
        <h1>Productos para crear tu próximo diseño.</h1>
        <p className="lead">Una selección de esmaltes, herramientas y accesorios, con enlaces adaptados a tu mercado.</p>
      </section>
      <nav className="market-tabs" aria-label="Mercado">
        {MARKET_IDS.map((id) => <a key={id} className={`market-tab ${id === market ? "active" : ""}`} href={`/?market=${id}`}>{MARKET_LABELS[id]}</a>)}
      </nav>
      <div className="catalog-summary">
        <h2>{MARKET_LABELS[market]}</h2>
        <p>{products.length} {products.length === 1 ? "producto" : "productos"}</p>
      </div>
      <section className="product-grid">
        {products.length === 0 ? <div className="empty">Todavía no hay productos publicados para este mercado.</div> : products.map((product) => {
          const price = formatPrice(product.offer.price, product.offer.currency);
          return <article className="product-card" key={product.id}>
            {/* The image host is editorial data, so a regular img supports any verified supplier URL. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="product-image" src={product.imageUrl} alt={product.name} />
            <div className="product-body">
              <p className="category">{product.category}</p>
              <h3>{product.name}</h3>
              {product.brand && <p className="brand-name">{product.brand}</p>}
              {product.description && <p className="description">{product.description}</p>}
              <div className="buy-row">
                <span className="price">{price || product.offer.store}</span>
                <a className="button" href={product.offer.url} target="_blank" rel="sponsored noopener noreferrer">Ver producto</a>
              </div>
            </div>
          </article>;
        })}
      </section>
      {products.length > 0 && <p className="disclosure">Algunos enlaces son de afiliado. Podemos recibir una comisión si realizas una compra, sin coste adicional para ti.</p>}
    </main>
  );
}
