import { type NextRequest, NextResponse } from "next/server";
import { isAdminRequest, hasSameOrigin } from "@/lib/auth";
import { CatalogConflictError, loadCatalog, saveCatalog } from "@/lib/storage";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  try {
    return NextResponse.json(await loadCatalog(), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("admin_catalog_read_failed", error);
    return NextResponse.json({ error: "No se pudo cargar el catálogo." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  try {
    const { catalog, baseRevision } = await request.json();
    if (typeof baseRevision !== "string") {
      return NextResponse.json({ error: "Falta la revisión base." }, { status: 400 });
    }
    return NextResponse.json(await saveCatalog(catalog, baseRevision), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof CatalogConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Hay datos no válidos.", issues: error.issues }, { status: 400 });
    }
    console.error("admin_catalog_save_failed", error);
    return NextResponse.json({ error: "No se pudo guardar el catálogo." }, { status: 500 });
  }
}
