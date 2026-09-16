import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import seedCatalog from "@/data/catalog.seed.json";
import { type Catalog, catalogSchema } from "./catalog";

const BLOB_PATH = "affiliate-catalog/catalog.json";
const LOCAL_PATH = path.join(process.cwd(), "data", "catalog.local.json");

export class CatalogConflictError extends Error {
  constructor() {
    super("El catálogo cambió en otra sesión. Recarga la página antes de guardar.");
  }
}

export type CatalogSnapshot = { catalog: Catalog; revision: string };

function localRevision(catalog: Catalog) {
  return createHash("sha256").update(JSON.stringify(catalog)).digest("hex");
}

function seedSnapshot(): CatalogSnapshot {
  const catalog = catalogSchema.parse(seedCatalog);
  return { catalog, revision: `seed-${localRevision(catalog)}` };
}

async function readLocal(): Promise<CatalogSnapshot> {
  try {
    const catalog = catalogSchema.parse(JSON.parse(await fs.readFile(LOCAL_PATH, "utf8")));
    return { catalog, revision: localRevision(catalog) };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return seedSnapshot();
    throw error;
  }
}

export async function loadCatalog(): Promise<CatalogSnapshot> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    if (process.env.VERCEL) throw new Error("Falta conectar un almacén Vercel Blob al proyecto.");
    return readLocal();
  }

  const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
  const blob = blobs.find((entry) => entry.pathname === BLOB_PATH);
  if (!blob) return seedSnapshot();

  const result = await get(BLOB_PATH, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream) {
    throw new Error("No se pudo leer el catálogo persistido.");
  }
  const catalog = catalogSchema.parse(await new Response(result.stream).json());
  return { catalog, revision: result.blob.etag };
}

export async function saveCatalog(input: unknown, baseRevision: string): Promise<CatalogSnapshot> {
  const catalog = catalogSchema.parse({
    ...(typeof input === "object" && input ? input : {}),
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
  });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    if (process.env.VERCEL) throw new Error("Falta conectar un almacén Vercel Blob al proyecto.");
    const current = await readLocal();
    if (current.revision !== baseRevision) throw new CatalogConflictError();
    await fs.writeFile(LOCAL_PATH, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
    return { catalog, revision: localRevision(catalog) };
  }

  const current = await loadCatalog();
  if (current.revision !== baseRevision) throw new CatalogConflictError();

  try {
    const result = await put(BLOB_PATH, JSON.stringify(catalog), {
      access: "private",
      contentType: "application/json; charset=utf-8",
      cacheControlMaxAge: 60,
      allowOverwrite: !current.revision.startsWith("seed-"),
      ...(current.revision.startsWith("seed-") ? {} : { ifMatch: current.revision }),
    });
    return { catalog, revision: result.etag };
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    const message = error instanceof Error ? error.message : "";
    if (/Precondition|already exists|already been uploaded|409/i.test(`${name} ${message}`)) {
      throw new CatalogConflictError();
    }
    throw error;
  }
}
