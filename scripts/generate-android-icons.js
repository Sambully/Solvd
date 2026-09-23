const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcLogo = path.resolve(__dirname, '../public/logo.png');
const resDir = path.resolve(__dirname, '../android/app/src/main/res');

const densities = {
  'mdpi': [48, 108],
  'hdpi': [72, 162],
  'xhdpi': [96, 216],
  'xxhdpi': [144, 324],
  'xxxhdpi': [192, 432]
};

async function run() {
  const xmlContent = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#0f172a</color>\n</resources>\n';
  fs.writeFileSync(path.join(resDir, 'values', 'ic_launcher_background.xml'), xmlContent);
  console.log('Updated ic_launcher_background.xml');

  for (const [density, [legacySize, fgSize]] of Object.entries(densities)) {
    const folder = path.join(resDir, 'mipmap-' + density);
    if (!fs.existsSync(folder)) continue;

    const safeSize = Math.round(fgSize * 0.7);
    const innerBuf = await sharp(srcLogo)
      .resize(safeSize, safeSize, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 0 } })
      .toBuffer();

    await sharp({
      create: {
        width: fgSize,
        height: fgSize,
        channels: 4,
        background: { r: 15, g: 23, b: 42, alpha: 0 }
      }
    })
      .composite([{ input: innerBuf, gravity: 'center' }])
      .png()
      .toFile(path.join(folder, 'ic_launcher_foreground.png'));

    const legacyInner = Math.round(legacySize * 0.85);
    const legacyBuf = await sharp(srcLogo)
      .resize(legacyInner, legacyInner, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
      .toBuffer();

    await sharp({
      create: {
        width: legacySize,
        height: legacySize,
        channels: 4,
        background: { r: 15, g: 23, b: 42, alpha: 1 }
      }
    })
      .composite([{ input: legacyBuf, gravity: 'center' }])
      .png()
      .toFile(path.join(folder, 'ic_launcher.png'));

    await sharp({
      create: {
        width: legacySize,
        height: legacySize,
        channels: 4,
        background: { r: 15, g: 23, b: 42, alpha: 1 }
      }
    })
      .composite([{ input: legacyBuf, gravity: 'center' }])
      .png()
      .toFile(path.join(folder, 'ic_launcher_round.png'));

    console.log('Generated icons for mipmap-' + density);
  }

  // Also update splash drawables
  const drawables = fs.readdirSync(resDir).filter(d => d.startsWith('drawable'));
  for (const d of drawables) {
    const splashFile = path.join(resDir, d, 'splash.png');
    if (fs.existsSync(splashFile)) {
      const meta = await sharp(splashFile).metadata();
      const splashSize = Math.min(meta.width || 400, meta.height || 400);
      const innerSplash = Math.round(splashSize * 0.4);
      const splashInnerBuf = await sharp(srcLogo)
        .resize(innerSplash, innerSplash, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
        .toBuffer();

      await sharp({
        create: {
          width: meta.width || 480,
          height: meta.height || 800,
          channels: 4,
          background: { r: 15, g: 23, b: 42, alpha: 1 }
        }
      })
        .composite([{ input: splashInnerBuf, gravity: 'center' }])
        .png()
        .toFile(splashFile);

      console.log('Generated splash for ' + d);
    }
  }

  console.log('All Android icons and splash drawables generated successfully!');
}

run().catch(console.error);
