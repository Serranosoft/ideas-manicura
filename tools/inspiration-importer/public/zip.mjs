export const ZIP_LIMITS = Object.freeze({
  maxArchives: 20,
  maxArchiveBytes: 120 * 1024 * 1024,
  maxImages: 150,
  maxImageBytes: 30 * 1024 * 1024,
  maxTotalBytes: 250 * 1024 * 1024,
});

const decoder = new TextDecoder("utf-8");
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let crc = n;
  for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  crcTable[n] = crc >>> 0;
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function readEndRecord(view) {
  if (view.byteLength < 22) throw new Error("No se encontró el índice de un archivo ZIP válido.");
  const first = Math.max(0, view.byteLength - 22 - 65535);
  for (let offset = view.byteLength - 22; offset >= first; offset--) {
    if (view.getUint32(offset, true) !== 0x06054b50) continue;
    if (offset + 22 + view.getUint16(offset + 20, true) !== view.byteLength) continue;
    if (view.getUint16(offset + 4, true) !== 0 || view.getUint16(offset + 6, true) !== 0 ||
        view.getUint16(offset + 8, true) !== view.getUint16(offset + 10, true)) {
      throw new Error("No se admiten ZIP repartidos en varios volúmenes.");
    }
    const count = view.getUint16(offset + 10, true);
    const size = view.getUint32(offset + 12, true);
    const start = view.getUint32(offset + 16, true);
    if (count === 0xffff || size === 0xffffffff || start === 0xffffffff) {
      throw new Error("Este ZIP usa ZIP64, que no se admite en el importador.");
    }
    if (count > 1000 || start + size > offset) throw new Error("El índice del ZIP no es válido o contiene demasiadas entradas.");
    return { count, start, size };
  }
  throw new Error("No se encontró el índice de un archivo ZIP válido.");
}

function safePath(name) {
  const path = name.replaceAll("\\", "/");
  if (!path || path.startsWith("/") || /^[A-Za-z]:/.test(path) || path.includes("\0") ||
      path.split("/").some((part) => part === ".." || part === ".")) {
    throw new Error("El ZIP contiene una ruta no permitida.");
  }
  return path;
}

function imageType(path) {
  if (/\.jpe?g$/i.test(path)) return "image/jpeg";
  if (/\.png$/i.test(path)) return "image/png";
  if (/\.webp$/i.test(path)) return "image/webp";
  return "";
}

function hasImageSignature(bytes, type) {
  if (type === "image/jpeg") return bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8;
  if (type === "image/png") return bytes.length >= 8 &&
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, i) => bytes[i] === value);
  if (type === "image/webp") return bytes.length >= 12 &&
    decoder.decode(bytes.subarray(0, 4)) === "RIFF" && decoder.decode(bytes.subarray(8, 12)) === "WEBP";
  return false;
}

async function inflate(bytes, expectedSize) {
  let stream;
  try {
    stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  } catch {
    throw new Error("Este navegador no puede descomprimir ZIP; actualízalo para usar esta función.");
  }
  const reader = stream.getReader();
  const output = new Uint8Array(expectedSize);
  let written = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (written + value.length > expectedSize) throw new Error("Una imagen del ZIP excede el tamaño declarado.");
      output.set(value, written);
      written += value.length;
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  }
  if (written !== expectedSize) throw new Error("Una imagen del ZIP está incompleta.");
  return output;
}

export async function readZipImages(file) {
  if (file.size > ZIP_LIMITS.maxArchiveBytes) throw new Error("El ZIP supera el límite de 120 MB.");
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const { count, start, size } = readEndRecord(view);
  const end = start + size;
  let offset = start;
  let totalBytes = 0;
  let skipped = 0;
  const images = [];

  for (let index = 0; index < count; index++) {
    if (offset + 46 > end || view.getUint32(offset, true) !== 0x02014b50) {
      throw new Error("El índice del ZIP está dañado.");
    }
    const flags = view.getUint16(offset + 8, true);
    const method = view.getUint16(offset + 10, true);
    const checksum = view.getUint32(offset + 16, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const diskStart = view.getUint16(offset + 34, true);
    const localOffset = view.getUint32(offset + 42, true);
    const next = offset + 46 + nameLength + extraLength + commentLength;
    if (next > end || diskStart !== 0 || compressedSize === 0xffffffff ||
        uncompressedSize === 0xffffffff || localOffset === 0xffffffff) {
      throw new Error("El ZIP contiene una entrada no válida o ZIP64.");
    }
    const path = safePath(decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLength)));
    offset = next;
    if (path.endsWith("/") || path.startsWith("__MACOSX/")) continue;
    const type = imageType(path);
    if (!type) { skipped++; continue; }
    if (flags & 1) throw new Error("No se admiten ZIP protegidos con contraseña.");
    if (method !== 0 && method !== 8) throw new Error("Una imagen del ZIP usa una compresión no compatible.");
    if (uncompressedSize === 0 || uncompressedSize > ZIP_LIMITS.maxImageBytes) {
      throw new Error("Una imagen del ZIP supera el límite de 30 MB.");
    }
    if (images.length >= ZIP_LIMITS.maxImages || totalBytes + uncompressedSize > ZIP_LIMITS.maxTotalBytes) {
      throw new Error("El ZIP contiene demasiadas imágenes o supera 250 MB descomprimidos.");
    }
    if (localOffset + 30 > start || view.getUint32(localOffset, true) !== 0x04034b50) {
      throw new Error("Una imagen del ZIP tiene una cabecera dañada.");
    }
    const dataOffset = localOffset + 30 + view.getUint16(localOffset + 26, true) + view.getUint16(localOffset + 28, true);
    if (dataOffset + compressedSize > start) throw new Error("Una imagen del ZIP tiene una longitud no válida.");
    const compressed = bytes.subarray(dataOffset, dataOffset + compressedSize);
    const imageBytes = method === 0 ? Uint8Array.from(compressed) : await inflate(compressed, uncompressedSize);
    if (imageBytes.length !== uncompressedSize || crc32(imageBytes) !== checksum || !hasImageSignature(imageBytes, type)) {
      throw new Error(`La imagen «${path}» está dañada o no coincide con su extensión.`);
    }
    totalBytes += uncompressedSize;
    images.push({ file: new File([imageBytes], path.split("/").at(-1), { type }), path });
  }
  if (offset !== end) throw new Error("El índice del ZIP tiene datos inesperados.");
  return { images, skipped, totalBytes };
}
