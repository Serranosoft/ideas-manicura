"use client";

import { useEffect, useMemo, useState } from "react";
import { MARKET_IDS, MARKET_LABELS, type Catalog, type MarketId, type Offer, type Product, slugifyProductId } from "@/lib/catalog";

type Snapshot = { catalog: Catalog; revision: string };

const DEFAULT_CURRENCIES: Record<MarketId, string> = {
  spain: "EUR",
  europe: "EUR",
  americas: "USD",
  east: "USD",
};

function emptyProduct(index: number): Product {
  return {
    id: `producto-${index}`,
    name: "",
    brand: "",
    description: "",
    category: "Esmaltes",
    imageUrl: "",
    active: true,
    priority: 0,
    offers: {},
  };
}

export default function CatalogEditor() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function load() {
    setMessage(null);
    const response = await fetch("/api/admin/catalog", { cache: "no-store" });
    if (response.status === 401) return window.location.assign("/admin/login");
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "No se pudo cargar el catálogo.");
    setSnapshot(body);
    setDirty(false);
    setSelectedIndex(0);
  }

  useEffect(() => {
    load().catch((error) => setMessage({ type: "error", text: error.message }));
  }, []);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const products = snapshot?.catalog.products ?? [];
  const selected = products[selectedIndex];
  const filtered = useMemo(() => products.map((product, index) => ({ product, index })).filter(({ product }) =>
    `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(query.toLowerCase())), [products, query]);

  function updateProduct(patch: Partial<Product>) {
    if (!snapshot || !selected) return;
    const next = structuredClone(snapshot);
    next.catalog.products[selectedIndex] = { ...next.catalog.products[selectedIndex], ...patch };
    setSnapshot(next);
    setDirty(true);
    setMessage(null);
  }

  function updateOffer(market: MarketId, patch: Partial<Offer>) {
    const previous = selected?.offers[market];
    if (!previous) return;
    updateProduct({ offers: { ...selected.offers, [market]: { ...previous, ...patch } } });
  }

  function toggleOffer(market: MarketId, enabled: boolean) {
    if (!selected) return;
    const offers = { ...selected.offers };
    if (enabled) offers[market] = { url: "", store: "", currency: DEFAULT_CURRENCIES[market] };
    else delete offers[market];
    updateProduct({ offers });
  }

  function addProduct() {
    if (!snapshot) return;
    const next = structuredClone(snapshot);
    next.catalog.products.push(emptyProduct(next.catalog.products.length + 1));
    setSnapshot(next);
    setSelectedIndex(next.catalog.products.length - 1);
    setQuery("");
    setDirty(true);
    setMessage(null);
  }

  function removeProduct() {
    if (!snapshot || !selected || !window.confirm(`¿Eliminar “${selected.name || selected.id}”?`)) return;
    const next = structuredClone(snapshot);
    next.catalog.products.splice(selectedIndex, 1);
    setSnapshot(next);
    setSelectedIndex(Math.max(0, Math.min(selectedIndex, next.catalog.products.length - 1)));
    setDirty(true);
    setMessage(null);
  }

  async function save() {
    if (!snapshot) return;
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/catalog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catalog: snapshot.catalog, baseRevision: snapshot.revision }),
      });
      if (response.status === 401) return window.location.assign("/admin/login");
      const body = await response.json();
      if (!response.ok) {
        const detail = Array.isArray(body.issues) && body.issues[0]?.message ? ` ${body.issues[0].message}` : "";
        throw new Error(`${body.error || "No se pudo guardar."}${detail}`);
      }
      setSnapshot(body);
      setDirty(false);
      setMessage({ type: "success", text: "Catálogo guardado y publicado." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "No se pudo guardar." });
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    window.location.assign("/admin/login");
  }

  if (!snapshot) return <main className="admin-shell"><div className="loading">{message?.text || "Cargando catálogo…"}</div></main>;

  return <main className="admin-shell">
    <header className="admin-header">
      <div><p className="eyebrow">Panel privado</p><h1>Productos afiliados</h1></div>
      <div className="admin-actions">
        <a className="button secondary" href="/" target="_blank">Ver catálogo</a>
        <button className="button secondary" onClick={logout}>Salir</button>
        <button className="button" onClick={save} disabled={!dirty || saving}>{saving ? "Guardando…" : dirty ? "Guardar y publicar" : "Guardado"}</button>
      </div>
    </header>
    {message && <p className={message.type} role="status">{message.text}</p>}
    <div className="admin-layout">
      <aside className="panel sidebar">
        <div className="search-row">
          <input aria-label="Buscar productos" placeholder="Buscar…" value={query} onChange={(event) => setQuery(event.target.value)} />
          <button className="button" onClick={addProduct} aria-label="Añadir producto">＋</button>
        </div>
        <div className="product-list">
          {filtered.map(({ product, index }) => <button key={`${product.id}-${index}`} className={`product-list-item ${selectedIndex === index ? "selected" : ""}`} onClick={() => setSelectedIndex(index)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {product.imageUrl ? <img src={product.imageUrl} alt="" /> : <span />}
            <span><strong>{product.name || "Producto sin nombre"}</strong><small>{product.category} · {Object.keys(product.offers).length} mercados</small></span>
            <span className={`status-dot ${product.active ? "active" : ""}`} title={product.active ? "Publicado" : "Oculto"} />
          </button>)}
          {!filtered.length && <p className="empty">Sin resultados.</p>}
        </div>
      </aside>
      <section className="panel editor">
        {!selected ? <div className="empty">Añade el primer producto para comenzar.</div> : <>
          <div className="editor-title"><h2>{selected.name || "Nuevo producto"}</h2><button className="button danger" onClick={removeProduct}>Eliminar</button></div>
          <div className="form-grid">
            <label className="field"><span>Nombre *</span><input value={selected.name} onChange={(event) => updateProduct({ name: event.target.value })} /></label>
            <label className="field"><span>Marca</span><input value={selected.brand} onChange={(event) => updateProduct({ brand: event.target.value })} /></label>
            <label className="field"><span>ID estable *</span><div className="search-row"><input value={selected.id} onChange={(event) => updateProduct({ id: event.target.value })} /><button className="button secondary" type="button" onClick={() => updateProduct({ id: slugifyProductId(selected.name) })}>Generar</button></div></label>
            <label className="field"><span>Categoría *</span><input value={selected.category} onChange={(event) => updateProduct({ category: event.target.value })} /></label>
            <label className="field wide"><span>URL de imagen *</span><input type="url" value={selected.imageUrl} onChange={(event) => updateProduct({ imageUrl: event.target.value })} placeholder="https://…" /></label>
            <label className="field wide"><span>Descripción</span><textarea value={selected.description} onChange={(event) => updateProduct({ description: event.target.value })} /></label>
            <label className="field"><span>Orden (menor aparece antes)</span><input type="number" min="0" max="9999" value={selected.priority} onChange={(event) => updateProduct({ priority: Number(event.target.value) || 0 })} /></label>
            <label className="check"><input type="checkbox" checked={selected.active} onChange={(event) => updateProduct({ active: event.target.checked })} /> Publicado</label>
          </div>
          <div className="offers">
            <h3>Enlaces por mercado</h3>
            <p className="brand-name">El producto solo aparecerá en los mercados que tengan un enlace activo.</p>
            <div className="offer-grid">
              {MARKET_IDS.map((market) => {
                const offer = selected.offers[market];
                return <div key={market} className={`offer-card ${offer ? "" : "disabled"}`}>
                  <label className="check"><input type="checkbox" checked={Boolean(offer)} onChange={(event) => toggleOffer(market, event.target.checked)} /><strong>{MARKET_LABELS[market]}</strong></label>
                  {offer && <div className="offer-fields">
                    <label className="field"><span>Tienda *</span><input value={offer.store} onChange={(event) => updateOffer(market, { store: event.target.value })} /></label>
                    <label className="field"><span>Moneda</span><input maxLength={3} value={offer.currency || ""} onChange={(event) => updateOffer(market, { currency: event.target.value.toUpperCase() || undefined })} /></label>
                    <label className="field url"><span>Enlace afiliado *</span><input type="url" value={offer.url} onChange={(event) => updateOffer(market, { url: event.target.value })} placeholder="https://…" /></label>
                    <label className="field"><span>Precio opcional</span><input type="number" min="0" step="0.01" value={offer.price ?? ""} onChange={(event) => updateOffer(market, { price: event.target.value === "" ? undefined : Number(event.target.value) })} /></label>
                  </div>}
                </div>;
              })}
            </div>
          </div>
          <footer className="editor-footer"><span className="brand-name">Última publicación: {new Date(snapshot.catalog.updatedAt).toLocaleString("es-ES")}</span><button className="button" onClick={save} disabled={!dirty || saving}>{saving ? "Guardando…" : "Guardar y publicar"}</button></footer>
        </>}
      </section>
    </div>
  </main>;
}
