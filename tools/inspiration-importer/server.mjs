import http from "node:http";
import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const publicDir = join(root, "public");
const dataDir = join(root, "data");
const configPath = join(root, ".env.local");
const categorySlugs = new Set([
    "efecto-espejo", "efecto-metal", "cat-eye", "verano", "flores", "animal-print",
    "coquette", "primavera", "francesas", "sencillas", "marmoladas",
    "aesthetic", "oscuras", "baby-boomer", "halloween", "navidad",
    "san-valentin", "3d", "efecto-aura", "feria", "tono-mate",
]);
const foundMedia = new Map();
const pendingUploads = new Map();
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function parseEnvFile(content) {
    const values = {};
    for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const match = trimmed.match(/^([A-Z][A-Z0-9_]*)\s*=\s*(.*)$/);
        if (!match) throw new Error(`Línea de configuración inválida: ${trimmed.slice(0, 30)}`);
        values[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
    }
    return values;
}

let fileConfig = {};
try {
    fileConfig = parseEnvFile(await readFile(configPath, "utf8"));
} catch (error) {
    if (error.code !== "ENOENT") throw error;
}
const config = { ...fileConfig, ...process.env };
const wpBase = (config.WP_SITE_URL || "https://mollydigital.manu-scholz.com").replace(/\/+$/, "");
const port = Number(config.PORT || 8787);

function sendJson(response, status, value) {
    const body = JSON.stringify(value);
    response.writeHead(status, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
    });
    response.end(body);
}

function safeError(error) {
    // Never return access tokens or WordPress application passwords to the browser.
    const message = String(error?.message || "Error inesperado");
    return message
        .replaceAll(config.IG_ACCESS_TOKEN || "\0", "[oculto]")
        .replaceAll(config.WP_APP_PASSWORD || "\0", "[oculto]");
}

async function readBody(request, limit = 32_000) {
    let size = 0;
    const chunks = [];
    for await (const chunk of request) {
        size += chunk.length;
        if (size > limit) throw new Error("El archivo o la solicitud supera el tamaño permitido.");
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, { ...options, signal: AbortSignal.timeout(25_000) });
    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error(`Respuesta no válida del servicio (${response.status}).`);
    }
    if (!response.ok) {
        const detail = data?.error?.message || data?.message || `HTTP ${response.status}`;
        const error = new Error(String(detail).slice(0, 300));
        error.status = response.status;
        throw error;
    }
    return data;
}

function wordpressHeaders(extra = {}) {
    const encoded = Buffer.from(`${config.WP_USER}:${config.WP_APP_PASSWORD}`).toString("base64");
    return { authorization: `Basic ${encoded}`, ...extra };
}

function requireInstagramConfig() {
    if (!config.IG_USER_ID || !config.IG_ACCESS_TOKEN) {
        throw new Error("Configura IG_USER_ID e IG_ACCESS_TOKEN en .env.local.");
    }
}

function requireWordpressConfig() {
    if (!config.WP_USER || !config.WP_APP_PASSWORD) {
        throw new Error("Configura WP_USER y WP_APP_PASSWORD en .env.local.");
    }
    if (!wpBase.startsWith("https://")) {
        throw new Error("WP_SITE_URL debe usar HTTPS.");
    }
}

async function wordpressPreflight(category = "") {
    requireWordpressConfig();
    const status = await fetchJson(`${wpBase}/wp-json/inspiration-importer/v1/status`, {
        headers: wordpressHeaders(),
    });
    if (status.ready !== true) throw new Error("El complemento de WordPress no está listo.");
    if (category === "cat-eye" && !status.categories?.includes(category)) {
        throw new Error("Actualiza el complemento de WordPress con el ZIP nuevo (versión 0.2.0) para subir imágenes a Cat eye.");
    }
    return status;
}

function normalize(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
}

function cleanHandle(value) {
    const handle = String(value || "").trim().replace(/^@/, "");
    if (!/^[A-Za-z0-9._]{1,30}$/.test(handle)) throw new Error(`Cuenta inválida: ${value}`);
    return handle;
}

function instagramPermalink(value) {
    try {
        const url = new URL(value);
        return url.protocol === "https:" && ["instagram.com", "www.instagram.com"].includes(url.hostname.toLowerCase())
            ? url.toString() : "";
    } catch {
        return "";
    }
}

async function searchAccount(handle, term) {
    const fields = `business_discovery.username(${handle}){username,media.limit(100){id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{media_type,media_url,thumbnail_url,id}}}`;
    const graphVersion = /^v\d+\.\d+$/.test(config.IG_GRAPH_VERSION || "") ? config.IG_GRAPH_VERSION : "v24.0";
    const url = new URL(`https://graph.facebook.com/${graphVersion}/${encodeURIComponent(config.IG_USER_ID)}`);
    url.searchParams.set("fields", fields);
    url.searchParams.set("access_token", config.IG_ACCESS_TOKEN);
    const data = await fetchJson(url);
    const media = data.business_discovery?.media?.data || [];
    return media
        .filter((item) => !term || normalize(item.caption).includes(normalize(term)))
        .flatMap((item) => {
            const images = item.media_type === "CAROUSEL_ALBUM" ? item.children?.data || [] : [item];
            return images.filter((image) => image.media_type === "IMAGE" && /^\d+$/.test(String(image.id))).map((image) => ({
                id: String(image.id),
                account: data.business_discovery?.username || handle,
                caption: item.caption || "",
                permalink: instagramPermalink(item.permalink),
                timestamp: item.timestamp || "",
                imageUrl: image.media_url || image.thumbnail_url || "",
            }));
        })
        .filter((item) => item.imageUrl);
}

async function handleSearch(request, response) {
    requireInstagramConfig();
    const input = JSON.parse((await readBody(request)).toString("utf8"));
    const handles = [...new Set(String(input.accounts || "").split(/[\s,;]+/).filter(Boolean).map(cleanHandle))];
    if (!handles.length || handles.length > 10) throw new Error("Indica entre 1 y 10 cuentas de Instagram.");
    const term = String(input.term || "").trim().slice(0, 100);
    const settled = await Promise.allSettled(handles.map((handle) => searchAccount(handle, term)));
    foundMedia.clear();
    const items = [];
    const errors = [];
    for (let i = 0; i < settled.length; i++) {
        if (settled[i].status === "fulfilled") {
            for (const item of settled[i].value) {
                foundMedia.set(item.id, item);
                items.push({ ...item, imageUrl: undefined });
            }
        } else {
            errors.push(`${handles[i]}: ${safeError(settled[i].reason)}`);
        }
    }
    items.sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
    sendJson(response, 200, { items, errors, searchedAccounts: handles.length, limit: 100 });
}

function allowedInstagramImage(url) {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return parsed.protocol === "https:" &&
        (host === "cdninstagram.com" || host.endsWith(".cdninstagram.com") ||
         host === "fbcdn.net" || host.endsWith(".fbcdn.net") ||
         host === "instagram.com" || host.endsWith(".instagram.com"));
}

async function downloadInstagramImage(url) {
    let current = url;
    for (let redirects = 0; redirects < 4; redirects++) {
        if (!allowedInstagramImage(current)) throw new Error("Instagram devolvió una dirección de imagen no permitida.");
        const response = await fetch(current, { redirect: "manual", signal: AbortSignal.timeout(25_000) });
        if ([301, 302, 303, 307, 308].includes(response.status)) {
            current = new URL(response.headers.get("location"), current).toString();
            continue;
        }
        if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) {
            throw new Error("No se pudo descargar la imagen de Instagram.");
        }
        if (Number(response.headers.get("content-length") || 0) > MAX_IMAGE_BYTES) {
            throw new Error("La imagen de Instagram es demasiado grande.");
        }
        const bytes = await readBody(response.body, MAX_IMAGE_BYTES);
        return { bytes, type: response.headers.get("content-type") };
    }
    throw new Error("Demasiadas redirecciones al descargar la imagen.");
}

async function handlePreview(response, id) {
    const item = foundMedia.get(id);
    if (!item) throw new Error("Imagen no encontrada. Repite la búsqueda.");
    const image = await downloadInstagramImage(item.imageUrl);
    response.writeHead(200, { "content-type": image.type, "cache-control": "private, max-age=300", "x-content-type-options": "nosniff" });
    response.end(image.bytes);
}

async function uploadAndClassify({ jpeg, category, sourcePermalink = "", mediaId = "" }) {
    if (!categorySlugs.has(category)) throw new Error("Selecciona una categoría válida.");
    if (jpeg.length < 100 || jpeg[0] !== 0xff || jpeg[1] !== 0xd8) {
        throw new Error("La imagen optimizada debe ser JPEG.");
    }
    await wordpressPreflight(category);
    const hash = createHash("sha256").update(jpeg).digest("hex");
    const key = mediaId ? `instagram:${mediaId}` : `local:${hash}`;
    let upload = pendingUploads.get(key);
    if (!upload) {
        const duplicatePath = mediaId ? `exists/${mediaId}` : `exists-hash/${hash}`;
        const duplicate = await fetchJson(`${wpBase}/wp-json/inspiration-importer/v1/${duplicatePath}`, {
            headers: wordpressHeaders(),
        });
        if (duplicate.exists) {
            return { id: duplicate.id, url: duplicate.url, category: duplicate.categoria, visible: true, classified: true, duplicate: true };
        }
        await mkdir(dataDir, { recursive: true });
        const filename = mediaId ? `instagram-${mediaId}.jpg` : `local-${hash.slice(0, 20)}.jpg`;
        await writeFile(join(dataDir, filename), jpeg);
        upload = await fetchJson(`${wpBase}/wp-json/wp/v2/media`, {
            method: "POST",
            headers: wordpressHeaders({
                "content-type": "image/jpeg",
                "content-disposition": `attachment; filename="${filename}"`,
            }),
            body: jpeg,
        });
        if (!Number.isInteger(upload.id)) throw new Error("WordPress no devolvió el ID de la imagen subida.");
        pendingUploads.set(key, upload);
    }
    let classified;
    try {
        classified = await fetchJson(`${wpBase}/wp-json/inspiration-importer/v1/classify/${upload.id}`, {
            method: "POST",
            headers: wordpressHeaders({ "content-type": "application/json" }),
            body: JSON.stringify({ categoria: category, source_permalink: sourcePermalink, source_media_id: mediaId, source_hash: hash }),
        });
    } catch (error) {
        throw new Error(`La imagen se subió a WordPress con ID ${upload.id}, pero no se clasificó: ${safeError(error)}`);
    }
    pendingUploads.delete(key);
    let visible = false;
    try {
        const gallery = await fetchJson(`${wpBase}/wp-json/custom/v1/media-filtered?app=diseno-de-unas&categoria=${encodeURIComponent(category)}`);
        visible = Array.isArray(gallery) && gallery.some((entry) => Number(entry.id) === upload.id);
    } catch {
        // Keep the upload result; the WordPress connection may have failed after classification.
    }
    return { id: upload.id, url: upload.source_url, category, visible, classified: classified.classified === true };
}

async function handleImport(request, response) {
    const id = String(request.headers["x-media-id"] || "");
    const category = String(request.headers["x-category"] || "");
    const item = foundMedia.get(id);
    if (!item) throw new Error("Imagen no encontrada. Repite la búsqueda.");
    const jpeg = await readBody(request, MAX_IMAGE_BYTES);
    sendJson(response, 200, await uploadAndClassify({ jpeg, category, sourcePermalink: item.permalink, mediaId: id }));
}

async function handleFileImport(request, response) {
    const category = String(request.headers["x-category"] || "");
    const sourceInput = String(request.headers["x-source-url"] || "").trim();
    const sourcePermalink = sourceInput ? instagramPermalink(sourceInput) : "";
    if (sourceInput && !sourcePermalink) throw new Error("El enlace de origen debe ser una URL de Instagram con HTTPS.");
    const jpeg = await readBody(request, MAX_IMAGE_BYTES);
    sendJson(response, 200, await uploadAndClassify({ jpeg, category, sourcePermalink }));
}

const staticFiles = new Map([
    ["/", ["index.html", "text/html; charset=utf-8"]],
    ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
    ["/zip.mjs", ["zip.mjs", "text/javascript; charset=utf-8"]],
    ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
]);

const server = http.createServer(async (request, response) => {
    try {
        const url = new URL(request.url, `http://127.0.0.1:${port}`);
        if (request.method === "GET" && staticFiles.has(url.pathname)) {
            const [file, type] = staticFiles.get(url.pathname);
            response.writeHead(200, { "content-type": type, "x-content-type-options": "nosniff", "cache-control": "no-store" });
            response.end(await readFile(join(publicDir, file)));
        } else if (request.method === "GET" && url.pathname === "/inspiration-importer-wp.zip") {
            const pluginZip = await readFile(join(root, "inspiration-importer-wp.zip"));
            response.writeHead(200, {
                "content-type": "application/zip",
                "content-disposition": 'attachment; filename="inspiration-importer-wp.zip"',
                "cache-control": "no-store",
                "x-content-type-options": "nosniff",
            });
            response.end(pluginZip);
        } else if (request.method === "GET" && url.pathname === "/api/status") {
            let wordpress = false;
            let wordpressState = "unconfigured";
            let wordpressError = "";
            if (config.WP_USER && config.WP_APP_PASSWORD) {
                try {
                    const pluginStatus = await wordpressPreflight();
                    wordpress = true;
                    wordpressState = pluginStatus.categories?.includes("cat-eye") ? "ready" : "plugin_outdated";
                    if (wordpressState === "plugin_outdated") {
                        wordpressError = "Actualiza el complemento a la versión 0.2.0 para activar Cat eye.";
                    }
                } catch (error) {
                    wordpressState = error.status === 404 ? "plugin_missing" : "connection_error";
                    wordpressError = safeError(error);
                }
            }
            sendJson(response, 200, { instagram: Boolean(config.IG_USER_ID && config.IG_ACCESS_TOKEN), wordpress, wordpressState, wordpressError });
        } else if (request.method === "POST" && url.pathname === "/api/search") {
            await handleSearch(request, response);
        } else if (request.method === "GET" && url.pathname === "/api/image") {
            await handlePreview(response, url.searchParams.get("id"));
        } else if (request.method === "POST" && url.pathname === "/api/import") {
            await handleImport(request, response);
        } else if (request.method === "POST" && url.pathname === "/api/import-file") {
            await handleFileImport(request, response);
        } else {
            sendJson(response, 404, { error: "Ruta no encontrada." });
        }
    } catch (error) {
        sendJson(response, 400, { error: safeError(error) });
    }
});

server.listen(port, "127.0.0.1", () => {
    process.stdout.write(`Importador de inspiración: http://127.0.0.1:${port}\n`);
});
