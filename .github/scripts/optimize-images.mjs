/**
 * Optimise les images ajoutées/modifiées par Decap CMS.
 *
 * Usage : node optimize-images.mjs <file1> [file2 …]
 *
 * Règles appliquées :
 *  - JPEG/PNG > 1920 px de large → redimensionnés à 1920 px (ratio conservé)
 *  - JPEG → qualité 80, progressive
 *  - PNG  → compression maximale
 *  - WebP → qualité 80
 *  - Les fichiers < 10 Ko sont ignorés (déjà petits)
 */

import { readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const MAX_WIDTH = 1920;
const JPEG_QUALITY = 80;
const WEBP_QUALITY = 80;
const MIN_SIZE_BYTES = 10 * 1024; // 10 Ko

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(ext)) {
    console.log(`⏭  ${filePath} — extension ignorée`);
    return false;
  }

  const { size: originalSize } = await stat(filePath);
  if (originalSize < MIN_SIZE_BYTES) {
    console.log(
      `⏭  ${filePath} — trop petit (${(originalSize / 1024).toFixed(1)} Ko)`
    );
    return false;
  }

  const buffer = await readFile(filePath);
  let pipeline = sharp(buffer).rotate(); // auto-rotate via EXIF

  // Redimensionner si trop large
  const metadata = await sharp(buffer).metadata();
  if (metadata.width && metadata.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  // Appliquer la compression selon le format
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, progressive: true });
      break;
    case ".png":
      pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true });
      break;
    case ".webp":
      pipeline = pipeline.webp({ quality: WEBP_QUALITY });
      break;
  }

  const optimized = await pipeline.toBuffer();

  // Ne réécrire que si le fichier est effectivement plus petit
  if (optimized.length >= originalSize) {
    console.log(
      `⏭  ${filePath} — déjà optimisé (${(originalSize / 1024).toFixed(1)} Ko)`
    );
    return false;
  }

  await writeFile(filePath, optimized);
  const saved = (((originalSize - optimized.length) / originalSize) * 100).toFixed(1);
  console.log(
    `✅ ${filePath} — ${(originalSize / 1024).toFixed(1)} Ko → ${(optimized.length / 1024).toFixed(1)} Ko (−${saved} %)`
  );
  return true;
}

// ---- main ----
const files = process.argv.slice(2);
if (files.length === 0) {
  console.log("Aucun fichier à optimiser.");
  process.exit(0);
}

let optimizedCount = 0;
for (const file of files) {
  try {
    const changed = await optimizeImage(file);
    if (changed) optimizedCount++;
  } catch (err) {
    console.error(`❌ ${file} — ${err.message}`);
  }
}

console.log(`\n${optimizedCount} image(s) optimisée(s) sur ${files.length} fichier(s).`);
// Code de sortie pour signaler au workflow s'il faut committer
process.exit(optimizedCount > 0 ? 0 : 78); // 78 = rien à committer
