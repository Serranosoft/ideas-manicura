import { readZipImages, ZIP_LIMITS } from "./zip.mjs";

const categories = [
  ["efecto-espejo", "Efecto espejo"], ["efecto-metal", "Efecto metal"],
  ["cat-eye", "Cat eye"],
  ["verano", "Verano"], ["flores", "Flores"], ["animal-print", "Animal print"],
  ["coquette", "Coquette"], ["primavera", "Primavera"], ["francesas", "Francesas"],
  ["sencillas", "Sencillas"], ["marmoladas", "Marmoladas"], ["aesthetic", "Aesthetic"],
  ["oscuras", "Oscuras"], ["baby-boomer", "Baby boomer"], ["halloween", "Halloween"],
  ["navidad", "Navidad"], ["san-valentin", "San Valentín"], ["3d", "3D"],
  ["efecto-aura", "Efecto aura"], ["feria", "Feria"], ["tono-mate", "Tono mate"],
];
const elements = {
  form: document.querySelector("#search-form"),
  searchButton: document.querySelector("#search-button"),
  notice: document.querySelector("#notice"),
  gallery: document.querySelector("#gallery"),
  resultCount: document.querySelector("#result-count"),
  selectionBar: document.querySelector("#selection-bar"),
  selectedCount: document.querySelector("#selected-count"),
  bulkCategory: document.querySelector("#bulk-category"),
  importButton: document.querySelector("#import-button"),
  selectAll: document.querySelector("#select-all"),
  clearAll: document.querySelector("#clear-all"),
  igStatus: document.querySelector("#ig-status"),
  wpStatus: document.querySelector("#wp-status"),
  fileInput: document.querySelector("#file-input"),
  fileDrop: document.querySelector("#file-drop"),
  archiveControls: document.querySelector("#archive-controls"),
  metaSection: document.querySelector("#meta-section"),
};
let items = [];
let busy = false;
let nextLocalId = 1;
let nextArchiveId = 1;

for (const [slug, title] of categories) elements.bulkCategory.add(new Option(title, slug));

function categorySelect(selected = "") {
  const select = document.createElement("select");
  select.append(new Option("Elegir categoría…", ""));
  for (const [slug, title] of categories) select.append(new Option(title, slug));
  select.value = selected;
  return select;
}

function selectedItems() { return items.filter((item) => item.selected && !item.uploaded); }
function readyItems() { return selectedItems().filter((item) => item.category); }

function updateSelection() {
  const count = selectedItems().length;
  const readyCount = readyItems().length;
  elements.selectedCount.textContent = String(count);
  elements.selectionBar.hidden = count === 0;
  document.querySelector("#ready-summary").textContent = `${readyCount} ${readyCount === 1 ? "lista" : "listas"} para subir${count > readyCount ? ` · ${count - readyCount} sin categoría` : ""}`;
  elements.importButton.textContent = `Optimizar y subir (${readyCount}) ↑`;
  elements.importButton.disabled = busy || readyCount === 0;
  elements.selectAll.disabled = items.length === 0 || busy;
  elements.clearAll.disabled = items.length === 0 || busy;
  elements.bulkCategory.disabled = busy;
  elements.fileInput.disabled = busy;
  for (const control of elements.gallery.querySelectorAll("button, select, input")) {
    control.disabled = busy || control.closest(".card").dataset.uploaded === "true";
  }
  for (const control of elements.archiveControls.querySelectorAll("select")) control.disabled = busy;
}

function setNotice(message, error = false) {
  elements.notice.textContent = message;
  elements.notice.classList.toggle("error", error);
  elements.notice.hidden = !message;
}

function replaceItems(nextItems) {
  for (const item of items) if (item.objectUrl) URL.revokeObjectURL(item.objectUrl);
  items = nextItems;
  render();
}

function removeItem(item) {
  if (busy || item.uploaded) return;
  items = items.filter((candidate) => candidate !== item);
  if (item.objectUrl) URL.revokeObjectURL(item.objectUrl);
  render();
  setNotice(items.length ? "Imagen retirada de la tanda." : "La tanda está vacía. Añade fotos o ZIP para continuar.");
}

function localItem(file, archiveId = "", archiveName = "", entryName = file.name) {
  return {
    id: `local-${nextLocalId++}`,
    file,
    archiveId,
    archiveName,
    entryName,
    objectUrl: URL.createObjectURL(file),
    selected: true,
    category: "",
    source: "",
    status: "",
    uploaded: false,
  };
}

async function addFiles(fileList) {
  if (busy) return;
  const files = [...fileList];
  if (!files.length) return;
  elements.fileInput.value = "";
  const isZip = (file) => /\.zip$/i.test(file.name) || ["application/zip", "application/x-zip-compressed"].includes(file.type);
  const existingArchives = new Set(items.map((item) => item.archiveId).filter(Boolean)).size;
  if (existingArchives + files.filter(isZip).length > ZIP_LIMITS.maxArchives) {
    setNotice(`Se admiten hasta ${ZIP_LIMITS.maxArchives} ZIP en una tanda.`, true);
    return;
  }
  busy = true;
  elements.searchButton.disabled = true;
  elements.fileInput.disabled = true;
  updateSelection();
  const added = [];
  const problems = [];
  let skipped = 0;
  let totalBytes = items.reduce((sum, item) => sum + (item.file?.size || 0), 0);
  try {
    for (const [index, file] of files.entries()) {
      setNotice(`Leyendo archivo ${index + 1} de ${files.length}: ${file.name}…`);
      if (isZip(file)) {
        try {
          const result = await readZipImages(file);
          if (!result.images.length) {
            problems.push(`${file.name}: no contiene JPG, PNG ni WebP.`);
          } else if (items.length + added.length + result.images.length > ZIP_LIMITS.maxImages ||
                     totalBytes + result.totalBytes > ZIP_LIMITS.maxTotalBytes) {
            problems.push(`${file.name}: se superaría el límite de 150 imágenes o 250 MB descomprimidos.`);
          } else {
            const archiveId = `zip-${nextArchiveId++}`;
            for (const image of result.images) added.push(localItem(image.file, archiveId, file.name, image.path));
            totalBytes += result.totalBytes;
          }
          skipped += result.skipped;
        } catch (error) {
          problems.push(`${file.name}: ${error.message}`);
        }
      } else if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
                 file.size > ZIP_LIMITS.maxImageBytes) {
        problems.push(`${file.name}: solo se admiten JPG, PNG o WebP de hasta 30 MB.`);
      } else if (items.length + added.length >= ZIP_LIMITS.maxImages ||
                 totalBytes + file.size > ZIP_LIMITS.maxTotalBytes) {
        problems.push(`${file.name}: se superaría el límite de 150 imágenes o 250 MB.`);
      } else {
        added.push(localItem(file));
        totalBytes += file.size;
      }
    }
  } catch (error) {
    for (const item of added) URL.revokeObjectURL(item.objectUrl);
    setNotice(`No se pudieron leer los archivos: ${error.message}`, true);
    return;
  } finally {
    busy = false;
    elements.searchButton.disabled = false;
    elements.fileInput.disabled = false;
    updateSelection();
  }
  items.push(...added);
  render();
  const summary = `${added.length} imágenes añadidas.${skipped ? ` ${skipped} archivos no fotográficos omitidos.` : ""}`;
  setNotice(`${summary}${problems.length ? ` Problemas: ${problems.join(" · ")}` : " Elige sus categorías antes de subirlas."}`, problems.length > 0);
  if (added.length) document.querySelector("#results-title").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderArchiveControls() {
  elements.archiveControls.replaceChildren();
  const archives = new Map();
  for (const item of items) {
    if (!item.archiveId || item.uploaded) continue;
    if (!archives.has(item.archiveId)) archives.set(item.archiveId, []);
    archives.get(item.archiveId).push(item);
  }
  elements.archiveControls.hidden = archives.size === 0;
  for (const groupItems of archives.values()) {
    const row = document.createElement("div");
    row.className = "archive-row";
    const name = document.createElement("strong");
    name.textContent = `ZIP · ${groupItems[0].archiveName}`;
    const count = document.createElement("span");
    count.textContent = `${groupItems.length} ${groupItems.length === 1 ? "imagen" : "imágenes"}`;
    const label = document.createElement("label");
    label.textContent = "Categoría para este ZIP";
    const common = groupItems.every((item) => item.category === groupItems[0].category) ? groupItems[0].category : "";
    const select = categorySelect(common);
    if (!common && groupItems.some((item) => item.category)) select.options[0].textContent = "Categorías individuales";
    select.disabled = busy;
    select.addEventListener("change", () => {
      if (busy) return;
      for (const item of groupItems) {
        item.category = select.value;
        if (select.value) item.selected = true;
      }
      render();
    });
    label.append(select);
    row.append(name, count, label);
    elements.archiveControls.append(row);
  }
}

function render() {
  elements.gallery.replaceChildren();
  elements.resultCount.textContent = String(items.length);
  renderArchiveControls();
  for (const item of items) {
    const card = document.createElement("article");
    card.className = `card${item.selected ? " selected" : ""}`;
    card.dataset.uploaded = String(item.uploaded);
    const photo = document.createElement("button");
    photo.type = "button";
    photo.className = "photo";
    photo.setAttribute("aria-label", `${item.selected ? "Deseleccionar" : "Seleccionar"} ${item.file ? item.file.name : `imagen de @${item.account}`}`);
    photo.setAttribute("aria-pressed", String(item.selected));
    const image = document.createElement("img");
    image.src = item.objectUrl || `/api/image?id=${encodeURIComponent(item.id)}`;
    image.alt = item.file?.name || item.caption.slice(0, 100) || `Imagen de @${item.account}`;
    image.loading = "lazy";
    const check = document.createElement("span");
    check.className = "check";
    check.textContent = "✓";
    photo.append(image, check);
    photo.addEventListener("click", () => {
      if (busy || item.uploaded) return;
      item.selected = !item.selected;
      card.classList.toggle("selected", item.selected);
      photo.setAttribute("aria-pressed", String(item.selected));
      updateSelection();
    });
    const body = document.createElement("div");
    body.className = "card-body";
    const meta = document.createElement("div");
    meta.className = "card-meta";
    const account = document.createElement("strong");
    account.textContent = item.archiveName ? `ZIP · ${item.archiveName}` : item.file ? "Archivo local" : `@${item.account}`;
    meta.append(account);
    if (item.permalink) {
      const link = document.createElement("a");
      link.href = item.permalink;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Ver origen ↗";
      meta.append(link);
    }
    const caption = document.createElement("p");
    caption.className = "caption";
    caption.textContent = item.entryName || item.caption || "Sin descripción";
    const label = document.createElement("label");
    label.textContent = "CATEGORÍA";
    const select = categorySelect(item.category);
    select.addEventListener("change", () => {
      if (busy || item.uploaded) return;
      item.category = select.value;
      if (select.value) item.selected = true;
      card.classList.toggle("selected", item.selected);
      photo.setAttribute("aria-pressed", String(item.selected));
      renderArchiveControls();
      updateSelection();
    });
    label.append(select);
    const status = document.createElement("p");
    status.className = `item-status${item.error ? " error" : item.uploaded ? " success" : ""}`;
    status.textContent = item.status || "";
    item.statusElement = status;
    body.append(meta, caption, label);
    if (item.file) {
      const sourceLabel = document.createElement("label");
      sourceLabel.className = "source-label";
      sourceLabel.textContent = "ENLACE ORIGINAL · OPCIONAL";
      const sourceInput = document.createElement("input");
      sourceInput.type = "url";
      sourceInput.placeholder = "https://www.instagram.com/p/…";
      sourceInput.value = item.source || "";
      sourceInput.addEventListener("input", () => { item.source = sourceInput.value.trim(); });
      sourceLabel.append(sourceInput);
      body.append(sourceLabel);
    }
    body.append(status);
    if (!item.uploaded) {
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "remove-image";
      removeButton.textContent = "Quitar imagen";
      removeButton.setAttribute("aria-label", `Quitar ${item.entryName || item.file?.name || `imagen de @${item.account}`} de la tanda`);
      removeButton.addEventListener("click", () => removeItem(item));
      body.append(removeButton);
    }
    card.append(photo, body);
    elements.gallery.append(card);
  }
  updateSelection();
}

async function api(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Error ${response.status}`);
  return data;
}

async function refreshStatus() {
  try {
    const status = await api("/api/status");
    elements.igStatus.textContent = status.instagram ? "● Búsqueda automática disponible" : "○ Meta API opcional";
    elements.wpStatus.textContent = status.wordpressState === "plugin_outdated" ? "○ Actualizar complemento · Cat eye"
      : status.wordpress ? "● WordPress listo"
      : status.wordpressState === "plugin_missing" ? "○ Instalar complemento en WordPress"
      : status.wordpressState === "connection_error" ? "○ Revisar conexión con WordPress"
      : "○ Configurar WordPress";
    elements.wpStatus.title = status.wordpressError || "";
    elements.igStatus.className = `status ${status.instagram ? "ready" : "missing"}`;
    elements.wpStatus.className = `status ${status.wordpress && status.wordpressState !== "plugin_outdated" ? "ready" : "missing"}`;
    elements.metaSection.open = status.instagram;
  } catch {
    elements.igStatus.textContent = "No se pudo comprobar la conexión";
  }
}

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy) return;
  busy = true;
  elements.searchButton.disabled = true;
  setNotice("Buscando publicaciones…");
  elements.gallery.replaceChildren();
  try {
    const result = await api("/api/search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ accounts: document.querySelector("#accounts").value, term: document.querySelector("#term").value }),
    });
    const found = result.items.map((item) => ({ ...item, selected: false, category: "", status: "", uploaded: false }));
    const suffix = result.errors.length ? ` Problemas: ${result.errors.join(" · ")}` : "";
    replaceItems(found);
    setNotice(found.length ? suffix : `No se encontraron imágenes para este término en las últimas publicaciones.${suffix}`, Boolean(result.errors.length));
  } catch (error) {
    replaceItems([]);
    setNotice(error.message, true);
  } finally {
    busy = false;
    elements.searchButton.disabled = false;
    updateSelection();
  }
});

elements.selectAll.addEventListener("click", () => {
  if (busy) return;
  for (const item of items) if (!item.uploaded) item.selected = true;
  render();
});
elements.clearAll.addEventListener("click", () => {
  if (busy) return;
  for (const item of items) item.selected = false;
  render();
});
elements.bulkCategory.addEventListener("change", () => {
  if (busy || !elements.bulkCategory.value) return;
  for (const item of selectedItems()) item.category = elements.bulkCategory.value;
  elements.bulkCategory.value = "";
  render();
});

async function optimizedJpeg(item) {
  let source = item.file;
  if (!source) {
    const response = await fetch(`/api/image?id=${encodeURIComponent(item.id)}`);
    if (!response.ok) throw new Error("No se pudo obtener la imagen para optimizarla.");
    source = await response.blob();
  }
  const bitmap = await createImageBitmap(source);
  if (bitmap.width * bitmap.height > 45_000_000) {
    bitmap.close();
    throw new Error("La imagen tiene demasiados píxeles para optimizarla con seguridad.");
  }
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
  if (!blob) throw new Error("No se pudo convertir la imagen a JPEG.");
  return blob;
}

function itemStatus(item, message, kind = "") {
  item.status = message;
  item.error = kind === "error";
  item.statusElement.textContent = message;
  item.statusElement.className = `item-status ${kind}`;
}

elements.importButton.addEventListener("click", async () => {
  if (busy) return;
  const chosen = readyItems();
  const uncategorized = selectedItems().length - chosen.length;
  if (!chosen.length) {
    setNotice("Elige la categoría de al menos una imagen para subirla.", true);
    return;
  }
  busy = true;
  elements.importButton.disabled = true;
  elements.searchButton.disabled = true;
  updateSelection();
  let succeeded = 0;
  for (const [index, item] of chosen.entries()) {
    try {
      itemStatus(item, `Optimizando ${index + 1} de ${chosen.length}…`);
      const jpeg = await optimizedJpeg(item);
      itemStatus(item, `Subiendo ${(jpeg.size / 1024).toFixed(0)} KB…`);
      const headers = { "content-type": "image/jpeg", "x-category": item.category };
      if (item.file) {
        if (item.source) headers["x-source-url"] = item.source;
      } else {
        headers["x-media-id"] = item.id;
      }
      const result = await api(item.file ? "/api/import-file" : "/api/import", {
        method: "POST",
        headers,
        body: jpeg,
      });
      item.uploaded = true;
      item.selected = false;
      succeeded++;
      itemStatus(item, result.duplicate ? `✓ Ya existía en ${result.category} · ID ${result.id}` : result.visible ? `✓ Publicada en WordPress · ID ${result.id}` : `Subida con ID ${result.id}; revisar visibilidad en la app.`, result.visible ? "success" : "error");
    } catch (error) {
      itemStatus(item, error.message, "error");
    }
  }
  busy = false;
  elements.searchButton.disabled = false;
  setNotice(`${succeeded} de ${chosen.length} imágenes subidas.${uncategorized ? ` ${uncategorized} ${uncategorized === 1 ? "imagen sin categoría sigue pendiente" : "imágenes sin categoría siguen pendientes"}.` : ""}${succeeded < chosen.length ? " Revisa las tarjetas con error y vuelve a intentarlo." : ""}`, succeeded < chosen.length);
  render();
});

elements.fileInput.addEventListener("change", () => addFiles(elements.fileInput.files));
for (const type of ["dragenter", "dragover"]) {
  elements.fileDrop.addEventListener(type, (event) => {
    event.preventDefault();
    elements.fileDrop.classList.add("dragging");
  });
}
for (const type of ["dragleave", "drop"]) {
  elements.fileDrop.addEventListener(type, (event) => {
    event.preventDefault();
    elements.fileDrop.classList.remove("dragging");
  });
}
elements.fileDrop.addEventListener("drop", (event) => addFiles(event.dataTransfer.files));

refreshStatus();
