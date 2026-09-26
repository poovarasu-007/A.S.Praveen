/**
 * Login hero image optimizer.
 *
 * Source : public/images/farmer_bullock_ploughing.jpg  (1376x768 JPEG)
 * Outputs: responsive WebP variants + an optimized JPEG fallback that the
 *          <picture> element falls back to for very old browsers.
 *
 * Run with:  npm run optimize:login-image
 *
 * The hero is above the fold, so variants are deliberately sized for the
 * largest viewport that actually uses them instead of shipping the 1 MB
 * original to phones.
 */
import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

const SOURCE = path.resolve('public/images/farmer_bullock_ploughing.jpg');
const OUT_DIR = path.resolve('public/images');

/** @type {{ file: string, width: number, quality: number }[]} */
const VARIANTS = [
  { file: 'login-farm-desktop.webp', width: 1800, quality: 78 },
  { file: 'login-farm-tablet.webp', width: 1200, quality: 76 },
  { file: 'login-farm-mobile.webp', width: 800, quality: 74 },
];

const FALLBACK = { file: 'login-farm-fallback.jpg', width: 1400, quality: 78 };

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const source = await stat(SOURCE);
  console.log(`source      ${path.basename(SOURCE)}  ${kb(source.size)}`);

  for (const variant of VARIANTS) {
    const target = path.join(OUT_DIR, variant.file);
    await sharp(SOURCE)
      .resize({ width: variant.width, withoutEnlargement: false, kernel: 'lanczos3' })
      .webp({ quality: variant.quality, effort: 6 })
      .toFile(target);
    const { size } = await stat(target);
    const meta = await sharp(target).metadata();
    console.log(`generated   ${variant.file}  ${meta.width}x${meta.height}  ${kb(size)}`);
  }

  const fallbackPath = path.join(OUT_DIR, FALLBACK.file);
  await sharp(SOURCE)
    .resize({ width: FALLBACK.width, kernel: 'lanczos3' })
    .jpeg({ quality: FALLBACK.quality, mozjpeg: true, progressive: true })
    .toFile(fallbackPath);
  const fallback = await stat(fallbackPath);
  console.log(`generated   ${FALLBACK.file}  ${kb(fallback.size)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
