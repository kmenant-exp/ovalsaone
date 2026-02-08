/**
 * Optimise les images ajoutées/modifiées par Decap CMS.
 *
 * Usage : node optimize-images.mjs <file1> [file2 …]
 *
 * Règles appliquées :
 *  - Largeur max par dossier : actualites → 800 px, bureau → 112 px,
 *    entraineurs → 94 px, autres → 1920 px
 *  - JPEG → qualité 80, progressive
 *  - PNG  → compression maximale
 *  - WebP → qualité 80
 *  - Les fichiers < 10 Ko sont ignorés (déjà petits)
 */

import { readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DEFAULT_MAX_WIDTH = 1920;
const JPEG_QUALITY = 80;
const WEBP_QUALITY = 80;
const MIN_SIZE_BYTES = 10 * 1024; // 10 Ko

/** Largeur max par dossier (sous pages/src/assets/) */
const FOLDER_MAX_WIDTH = {
  actualites: 800,
  bureau: 112,
  entraineurs: 94,
};

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

/**
 * Détermine la largeur max en fonction du chemin du fichier.
 */
function getMaxWidth(filePath) {
  for (const [folder, width] of Object.entries(FOLDER_MAX_WIDTH)) {
    if (filePath.includes(`/assets/${folder}/`)) return width;
  }
  return DEFAULT_MAX_WIDTH;
}

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

  // Redimensionner selon la largeur max du dossier
  const metadata = await sharp(buffer).metadata();
  const maxWidth = getMaxWidth(filePath);
  if (metadata.width && metadata.width > maxWidth) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
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
