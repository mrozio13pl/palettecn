import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const SRC = './logo.svg';
const OUT = './dist-electron/icons';

mkdirSync(OUT, { recursive: true });

function toPng(size) {
    return sharp(SRC).resize(size, size).png().toBuffer();
}

// ── Linux ─────────────────────────────────────────────
await sharp(SRC).resize(512, 512).png().toFile(`${OUT}/icon.png`);
console.log('✓ icon.png');

// ── Windows .ico ───────────────────────────────────────
// ICO format: 6-byte file header, 16-byte dir entry per image, then PNG blobs
function buildIco(buffers) {
    const count = buffers.length;
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // reserved
    header.writeUInt16LE(1, 2); // type: icon
    header.writeUInt16LE(count, 4);

    let offset = 6 + 16 * count;
    const dirs = buffers.map((buf) => {
        // PNG IHDR: 8 sig + 4 len + 4 type = offset 16 for width, 20 for height
        const w = buf.readUInt32BE(16);
        const h = buf.readUInt32BE(20);
        const entry = Buffer.alloc(16);
        entry.writeUInt8(w >= 256 ? 0 : w, 0); // 0 means 256 in ICO spec
        entry.writeUInt8(h >= 256 ? 0 : h, 1);
        entry.writeUInt8(0, 2); // color count
        entry.writeUInt8(0, 3); // reserved
        entry.writeUInt16LE(1, 4); // planes
        entry.writeUInt16LE(32, 6); // bit depth
        entry.writeUInt32LE(buf.length, 8);
        entry.writeUInt32LE(offset, 12);
        offset += buf.length;
        return entry;
    });

    return Buffer.concat([header, ...dirs, ...buffers]);
}

const icoBuffers = await Promise.all([16, 32, 48, 256].map(toPng));
writeFileSync(`${OUT}/icon.ico`, buildIco(icoBuffers));
console.log('✓ icon.ico');

// ── macOS .icns ────────────────────────────────────────
// ICNS format: 8-byte file header, then chunks of [4-byte OSType, 4-byte size, PNG data]
// ic07=128 ic08=256 ic09=512 ic10=1024
function buildIcns(entries) {
    const chunks = entries.map(({ type, data }) => {
        const chunk = Buffer.alloc(8 + data.length);
        chunk.write(type, 0, 'ascii');
        chunk.writeUInt32BE(8 + data.length, 4);
        data.copy(chunk, 8);
        return chunk;
    });

    const body = Buffer.concat(chunks);
    const header = Buffer.alloc(8);
    header.write('icns', 0, 'ascii');
    header.writeUInt32BE(8 + body.length, 4);

    return Buffer.concat([header, body]);
}

const icnsEntries = await Promise.all(
    [
        { type: 'ic07', size: 128 },
        { type: 'ic08', size: 256 },
        { type: 'ic09', size: 512 },
        { type: 'ic10', size: 1024 },
    ].map(async ({ type, size }) => ({ type, data: await toPng(size) })),
);

writeFileSync(`${OUT}/icon.icns`, buildIcns(icnsEntries));
console.log('✓ icon.icns');
