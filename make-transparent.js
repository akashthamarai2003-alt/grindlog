const sharp = require('sharp');

async function processIcon(filename) {
  const { data, info } = await sharp(filename)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Convert white pixels to transparent
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // If pixel is very close to white
    if (r > 240 && g > 240 && b > 240) {
      data[i + 3] = 0; // Set alpha to 0
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .png()
  .toFile(filename.replace('.png', '-transparent.png'));
}

async function run() {
  await processIcon('public/icons/icon-192.png');
  await processIcon('public/icons/icon-512.png');
}

run().catch(console.error);
