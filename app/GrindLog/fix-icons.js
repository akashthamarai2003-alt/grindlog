const sharp = require('sharp');
const fs = require('fs');

async function fixIcons() {
  // 1. Create a rounded mask for icon-192.png to remove the white corners
  const size = 192;
  const rect = Buffer.from(
    `<svg><rect x="0" y="0" width="${size}" height="${size}" rx="48" ry="48" fill="white" /></svg>`
  );

  await sharp('public/icons/icon-192.png')
    .composite([{ input: rect, blend: 'dest-in' }])
    .png()
    .toFile('public/icons/icon-192-rounded.png');
    
  // Also do for 512
  const size512 = 512;
  const rect512 = Buffer.from(
    `<svg><rect x="0" y="0" width="${size512}" height="${size512}" rx="128" ry="128" fill="white" /></svg>`
  );
  await sharp('public/icons/icon-512.png')
    .composite([{ input: rect512, blend: 'dest-in' }])
    .png()
    .toFile('public/icons/icon-512-rounded.png');

  // Overwrite original icons
  fs.copyFileSync('public/icons/icon-192-rounded.png', 'public/icons/icon-192.png');
  fs.copyFileSync('public/icons/icon-512-rounded.png', 'public/icons/icon-512.png');

  // 2. Convert SVG badge to PNG
  await sharp('public/icons/notification-badge.svg')
    .resize(96, 96)
    .png()
    .toFile('public/icons/notification-badge.png');
    
  console.log("Icons fixed successfully!");
}

fixIcons().catch(console.error);
