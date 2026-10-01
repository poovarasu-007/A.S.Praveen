import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const IMAGES_DIR = path.resolve('public/images');

// Source images
const images = [
  { name: 'farmer_bullock_ploughing.jpg', title: 'Traditional Bullock Ploughing' },
  { name: 'farmer_close_ploughing.jpg', title: 'Farmer Soil Preparation' },
  { name: 'farmers_rain_field.jpg', title: 'Monsoon Paddy Transplanting' },
  { name: 'tractor_spraying_crops.jpg', title: 'Tractor Crop Care' },
  { name: 'drone_spraying_crops.jpg', title: 'Precision Agricultural Drone' },
];

async function createComposite() {
  console.log('Starting composite generation...');

  const CANVAS_WIDTH = 3840;
  const CANVAS_HEIGHT = 1080;
  const numImages = images.length;

  // Each panel width with generous overlap for feathering
  const panelWidth = Math.round(CANVAS_WIDTH / (numImages - 0.7)); // ~890px
  const overlap = 220; // 220px soft gradient blend between panels
  const actualWidth = panelWidth + overlap; // ~1110px

  console.log(`Canvas: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}, Panels: ${numImages}, Width: ${actualWidth}, Overlap: ${overlap}`);

  // Base background canvas: deep agricultural soil/botanical dark green
  const baseCanvas = sharp({
    create: {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      channels: 4,
      background: { r: 12, g: 38, b: 28, alpha: 1 },
    },
  });

  const compositeLayers = [];

  for (let i = 0; i < numImages; i++) {
    const imgInfo = images[i];
    const imgPath = path.join(IMAGES_DIR, imgInfo.name);

    if (!fs.existsSync(imgPath)) {
      console.error(`Missing image: ${imgPath}`);
      continue;
    }

    // Calculate position
    // First image starts at 0, last image ends at CANVAS_WIDTH
    const left = i === 0 ? 0 : Math.round((i * (CANVAS_WIDTH - actualWidth)) / (numImages - 1));
    const width = (i === 0 || i === numImages - 1) ? actualWidth : actualWidth;

    console.log(`Processing panel ${i + 1}/${numImages}: ${imgInfo.name} at left=${left}`);

    // Resize image to fit height, cover
    const resizedBuffer = await sharp(imgPath)
      .resize({
        width: width,
        height: CANVAS_HEIGHT,
        fit: 'cover',
        position: sharp.strategy.attention,
      })
      .toBuffer();

    // Create alpha mask for smooth gradient edge feathering
    // Left edge fades in if not first image; Right edge fades out if not last image
    const hasLeftFade = i > 0;
    const hasRightFade = i < numImages - 1;

    let maskSvg = `<svg width="${width}" height="${CANVAS_HEIGHT}">
      <defs>
        <linearGradient id="fade" x1="0%" y1="0%" x2="100%" y2="0%">`;

    if (hasLeftFade && hasRightFade) {
      const leftPercent = ((overlap / width) * 100).toFixed(1);
      const rightPercent = (((width - overlap) / width) * 100).toFixed(1);
      maskSvg += `
          <stop offset="0%" stop-color="#fff" stop-opacity="0" />
          <stop offset="${leftPercent}%" stop-color="#fff" stop-opacity="1" />
          <stop offset="${rightPercent}%" stop-color="#fff" stop-opacity="1" />
          <stop offset="100%" stop-color="#fff" stop-opacity="0" />`;
    } else if (hasLeftFade) {
      const leftPercent = ((overlap / width) * 100).toFixed(1);
      maskSvg += `
          <stop offset="0%" stop-color="#fff" stop-opacity="0" />
          <stop offset="${leftPercent}%" stop-color="#fff" stop-opacity="1" />
          <stop offset="100%" stop-color="#fff" stop-opacity="1" />`;
    } else if (hasRightFade) {
      const rightPercent = (((width - overlap) / width) * 100).toFixed(1);
      maskSvg += `
          <stop offset="0%" stop-color="#fff" stop-opacity="1" />
          <stop offset="${rightPercent}%" stop-color="#fff" stop-opacity="1" />
          <stop offset="100%" stop-color="#fff" stop-opacity="0" />`;
    } else {
      maskSvg += `<stop offset="0%" stop-color="#fff" stop-opacity="1" /><stop offset="100%" stop-color="#fff" stop-opacity="1" />`;
    }

    maskSvg += `
        </linearGradient>
      </defs>
      <rect width="${width}" height="${CANVAS_HEIGHT}" fill="url(#fade)" />
    </svg>`;

    const maskBuffer = Buffer.from(maskSvg);

    // Apply alpha mask to the panel
    const featheredBuffer = await sharp(resizedBuffer)
      .ensureAlpha()
      .composite([
        {
          input: maskBuffer,
          blend: 'dest-in',
        },
      ])
      .png()
      .toBuffer();

    compositeLayers.push({
      input: featheredBuffer,
      left: left,
      top: 0,
      blend: 'over',
    });
  }

  // Create composite
  console.log('Compositing all feathered layers...');
  let compositedImage = await baseCanvas.composite(compositeLayers).png().toBuffer();

  // Add subtle atmospheric sky gradient & cinematic grade overlay across the top sky
  const skyOverlaySvg = `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}">
    <defs>
      <!-- Sky smoothing gradient: unifies sky horizon across all panels -->
      <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4A7C59" stop-opacity="0.12" />
        <stop offset="35%" stop-color="#2D5A43" stop-opacity="0.05" />
        <stop offset="60%" stop-color="#000000" stop-opacity="0" />
      </linearGradient>
      <!-- Vignette for high readability and premium aesthetic -->
      <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
        <stop offset="60%" stop-color="#000000" stop-opacity="0" />
        <stop offset="100%" stop-color="#021C14" stop-opacity="0.35" />
      </radialGradient>
    </defs>
    <rect width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" fill="url(#skyGrad)" />
    <rect width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" fill="url(#vignette)" />
  </svg>`;

  console.log('Applying atmospheric overlay & vignette...');
  const finalBuffer = await sharp(compositedImage)
    .composite([
      {
        input: Buffer.from(skyOverlaySvg),
        blend: 'over',
      },
    ])
    .png()
    .toBuffer();

  // Output master composite files:
  // 1. High-res panorama WebP
  const outPanoramaWebp = path.join(IMAGES_DIR, 'agricultural_composite_panorama.webp');
  await sharp(finalBuffer)
    .webp({ quality: 84, effort: 6 })
    .toFile(outPanoramaWebp);
  console.log(`Saved: ${outPanoramaWebp} (${(fs.statSync(outPanoramaWebp).size / 1024).toFixed(0)} KB)`);

  // 2. High-res panorama JPG fallback
  const outPanoramaJpg = path.join(IMAGES_DIR, 'agricultural_composite_panorama.jpg');
  await sharp(finalBuffer)
    .jpeg({ quality: 85, mozjpeg: true, progressive: true })
    .toFile(outPanoramaJpg);
  console.log(`Saved: ${outPanoramaJpg} (${(fs.statSync(outPanoramaJpg).size / 1024).toFixed(0)} KB)`);

  // 3. Desktop standard 1920x1080 version
  const outDesktopWebp = path.join(IMAGES_DIR, 'agricultural_composite_1080p.webp');
  await sharp(finalBuffer)
    .resize(1920, 1080, { fit: 'cover' })
    .webp({ quality: 82, effort: 6 })
    .toFile(outDesktopWebp);
  console.log(`Saved: ${outDesktopWebp} (${(fs.statSync(outDesktopWebp).size / 1024).toFixed(0)} KB)`);

  console.log('Generating fitted 1920x1080 composite...');
  const FITTED_W = 1920;
  const FITTED_H = 1080;
  const fittedBase = sharp({
    create: {
      width: FITTED_W,
      height: FITTED_H,
      channels: 4,
      background: { r: 12, g: 38, b: 28, alpha: 1 },
    },
  });

  const fittedPanelW = Math.round(FITTED_W / (numImages - 0.7)); // ~446px
  const fittedOverlap = 110;
  const fittedActualW = fittedPanelW + fittedOverlap; // ~556px
  const fittedLayers = [];

  for (let i = 0; i < numImages; i++) {
    const imgInfo = images[i];
    const imgPath = path.join(IMAGES_DIR, imgInfo.name);
    const left = i === 0 ? 0 : Math.round((i * (FITTED_W - fittedActualW)) / (numImages - 1));

    const resizedBuffer = await sharp(imgPath)
      .resize({
        width: fittedActualW,
        height: FITTED_H,
        fit: 'cover',
        position: sharp.strategy.attention,
      })
      .toBuffer();

    const hasLeftFade = i > 0;
    const hasRightFade = i < numImages - 1;

    let maskSvg = `<svg width="${fittedActualW}" height="${FITTED_H}">
      <defs>
        <linearGradient id="fade${i}" x1="0%" y1="0%" x2="100%" y2="0%">`;

    if (hasLeftFade && hasRightFade) {
      const leftP = ((fittedOverlap / fittedActualW) * 100).toFixed(1);
      const rightP = (((fittedActualW - fittedOverlap) / fittedActualW) * 100).toFixed(1);
      maskSvg += `
          <stop offset="0%" stop-color="#fff" stop-opacity="0" />
          <stop offset="${leftP}%" stop-color="#fff" stop-opacity="1" />
          <stop offset="${rightP}%" stop-color="#fff" stop-opacity="1" />
          <stop offset="100%" stop-color="#fff" stop-opacity="0" />`;
    } else if (hasLeftFade) {
      const leftP = ((fittedOverlap / fittedActualW) * 100).toFixed(1);
      maskSvg += `
          <stop offset="0%" stop-color="#fff" stop-opacity="0" />
          <stop offset="${leftP}%" stop-color="#fff" stop-opacity="1" />
          <stop offset="100%" stop-color="#fff" stop-opacity="1" />`;
    } else if (hasRightFade) {
      const rightP = (((fittedActualW - fittedOverlap) / fittedActualW) * 100).toFixed(1);
      maskSvg += `
          <stop offset="0%" stop-color="#fff" stop-opacity="0" />
          <stop offset="${rightP}%" stop-color="#fff" stop-opacity="1" />
          <stop offset="100%" stop-color="#fff" stop-opacity="0" />`;
    } else {
      maskSvg += `<stop offset="0%" stop-color="#fff" stop-opacity="1" /><stop offset="100%" stop-color="#fff" stop-opacity="1" />`;
    }

    maskSvg += `
        </linearGradient>
      </defs>
      <rect width="${fittedActualW}" height="${FITTED_H}" fill="url(#fade${i})" />
    </svg>`;

    const featheredBuffer = await sharp(resizedBuffer)
      .ensureAlpha()
      .composite([{ input: Buffer.from(maskSvg), blend: 'dest-in' }])
      .png()
      .toBuffer();

    fittedLayers.push({
      input: featheredBuffer,
      left: left,
      top: 0,
      blend: 'over',
    });
  }

  const fittedComposited = await fittedBase.composite(fittedLayers).png().toBuffer();
  const fittedSkySvg = `<svg width="${FITTED_W}" height="${FITTED_H}">
    <defs>
      <linearGradient id="skyGradFitted" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4A7C59" stop-opacity="0.12" />
        <stop offset="35%" stop-color="#2D5A43" stop-opacity="0.05" />
        <stop offset="60%" stop-color="#000000" stop-opacity="0" />
      </linearGradient>
      <radialGradient id="vignetteFitted" cx="50%" cy="50%" r="70%">
        <stop offset="60%" stop-color="#000000" stop-opacity="0" />
        <stop offset="100%" stop-color="#021C14" stop-opacity="0.32" />
      </radialGradient>
    </defs>
    <rect width="${FITTED_W}" height="${FITTED_H}" fill="url(#skyGradFitted)" />
    <rect width="${FITTED_W}" height="${FITTED_H}" fill="url(#vignetteFitted)" />
  </svg>`;

  const fittedFinal = await sharp(fittedComposited)
    .composite([{ input: Buffer.from(fittedSkySvg), blend: 'over' }])
    .png()
    .toBuffer();

  const outFittedWebp = path.join(IMAGES_DIR, 'agricultural_composite_fitted.webp');
  await sharp(fittedFinal).webp({ quality: 84, effort: 6 }).toFile(outFittedWebp);
  console.log(`Saved: ${outFittedWebp} (${(fs.statSync(outFittedWebp).size / 1024).toFixed(0)} KB)`);

  const outFittedJpg = path.join(IMAGES_DIR, 'agricultural_composite_fitted.jpg');
  await sharp(fittedFinal).jpeg({ quality: 85, mozjpeg: true, progressive: true }).toFile(outFittedJpg);
  console.log(`Saved: ${outFittedJpg} (${(fs.statSync(outFittedJpg).size / 1024).toFixed(0)} KB)`);

  // Update login-farm variants so Login screen shows all photos together
  const outLoginDesktop = path.join(IMAGES_DIR, 'login-farm-desktop.webp');
  await sharp(fittedFinal)
    .resize(1920, 1080, { fit: 'cover' })
    .webp({ quality: 82, effort: 6 })
    .toFile(outLoginDesktop);

  const outLoginFallback = path.join(IMAGES_DIR, 'login-farm-fallback.jpg');
  await sharp(fittedFinal)
    .resize(1400, 788, { fit: 'cover' })
    .jpeg({ quality: 82, mozjpeg: true, progressive: true })
    .toFile(outLoginFallback);

  const outLoginMobile = path.join(IMAGES_DIR, 'login-farm-mobile.webp');
  await sharp(fittedFinal)
    .resize(800, 450, { fit: 'cover' })
    .webp({ quality: 78, effort: 6 })
    .toFile(outLoginMobile);

  const outLoginTablet = path.join(IMAGES_DIR, 'login-farm-tablet.webp');
  await sharp(fittedFinal)
    .resize(1200, 675, { fit: 'cover' })
    .webp({ quality: 80, effort: 6 })
    .toFile(outLoginTablet);

  console.log('All composite variants generated successfully!');
}

createComposite().catch((err) => {
  console.error('Error creating composite:', err);
  process.exit(1);
});
