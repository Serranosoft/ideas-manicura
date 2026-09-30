import test from "node:test";
import assert from "node:assert/strict";
import { deflateRawSync } from "node:zlib";
import { readZipImages } from "../tools/inspiration-importer/public/zip.mjs";

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x01, 0x02, 0xff, 0xd9]);
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function zip(entries) {
  const local = [];
  const central = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name);
    const data = Buffer.from(entry.data);
    const method = entry.method ?? 8;
    const compressed = method === 8 ? deflateRawSync(data) : data;
    const checksum = entry.badCrc ? 1 : crc32(data);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(entry.flags || 0, 6);
    localHeader.writeUInt16LE(method, 8);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    local.push(localHeader, name, compressed);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(entry.flags || 0, 8);
    centralHeader.writeUInt16LE(method, 10);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(entry.declaredSize ?? data.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt32LE(offset, 42);
    central.push(centralHeader, name);
    offset += localHeader.length + name.length + compressed.length;
  }
  const centralBytes = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBytes.length, 12);
  end.writeUInt32LE(offset, 16);
  return new File([Buffer.concat([...local, centralBytes, end])], "fotos.zip", { type: "application/zip" });
}

test("extrae JPG y PNG de carpetas y omite otros archivos", async () => {
  const result = await readZipImages(zip([
    { name: "diseños/flor.jpg", data: jpeg },
    { name: "diseños/rojo.png", data: png, method: 0 },
    { name: "notas.txt", data: Buffer.from("texto") },
  ]));
  assert.equal(result.images.length, 2);
  assert.equal(result.skipped, 1);
  assert.deepEqual(result.images.map((image) => image.path), ["diseños/flor.jpg", "diseños/rojo.png"]);
  assert.deepEqual(result.images.map((image) => image.file.type), ["image/jpeg", "image/png"]);
  assert.deepEqual(Buffer.from(await result.images[0].file.arrayBuffer()), jpeg);
});

test("rechaza rutas peligrosas y ZIP inválidos", async () => {
  await assert.rejects(readZipImages(zip([{ name: "../fuera.jpg", data: jpeg }])), /ruta no permitida/);
  await assert.rejects(readZipImages(new File([Buffer.from("no zip")], "mal.zip")), /ZIP válido/);
});

test("rechaza datos corruptos, ZIP cifrados y expansión superior a lo declarado", async () => {
  await assert.rejects(readZipImages(zip([{ name: "foto.jpg", data: jpeg, badCrc: true }])), /dañada/);
  await assert.rejects(readZipImages(zip([{ name: "foto.jpg", data: jpeg, flags: 1 }])), /contraseña/);
  await assert.rejects(readZipImages(zip([{ name: "foto.jpg", data: Buffer.concat([jpeg, Buffer.alloc(20000)]), declaredSize: 8 }])), /excede el tamaño declarado/);
});
