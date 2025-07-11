#!/usr/bin/env node

/**
 * Script to generate PWA icons from logo.png
 * Uses sharp library for high-quality image resizing
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Icon sizes needed for PWA
const iconSizes = [
  { size: 72, name: 'icon-72.png' },
  { size: 96, name: 'icon-96.png' },
  { size: 128, name: 'icon-128.png' },
  { size: 144, name: 'icon-144.png' },
  { size: 152, name: 'icon-152.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 384, name: 'icon-384.png' },
  { size: 512, name: 'icon-512.png' },
];

// Shortcut icons
const shortcutIcons = [
  { size: 96, name: 'shortcut-meditation.png' },
  { size: 96, name: 'shortcut-focus.png' },
  { size: 96, name: 'shortcut-relax.png' },
];

async function generateIcons() {
  const logoPath = path.join(__dirname, '../public/logo.png');
  const publicDir = path.join(__dirname, '../public');
  
  // Check if logo exists
  if (!fs.existsSync(logoPath)) {
    console.error('❌ Logo not found at:', logoPath);
    process.exit(1);
  }

  console.log('🎨 Generating PWA icons from logo.png...');
  
  try {
    // Generate main PWA icons
    for (const icon of iconSizes) {
      const outputPath = path.join(publicDir, icon.name);
      await sharp(logoPath)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png({ quality: 90 })
        .toFile(outputPath);
      
      console.log(`✅ Generated ${icon.name} (${icon.size}x${icon.size})`);
    }
    
    // Generate shortcut icons (slightly different styling)
    for (const icon of shortcutIcons) {
      const outputPath = path.join(publicDir, icon.name);
      await sharp(logoPath)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png({ quality: 90 })
        .toFile(outputPath);
      
      console.log(`✅ Generated ${icon.name} (${icon.size}x${icon.size})`);
    }
    
    // Generate favicon
    const faviconPath = path.join(publicDir, 'favicon.ico');
    await sharp(logoPath)
      .resize(32, 32, { fit: 'contain' })
      .png()
      .toFile(faviconPath.replace('.ico', '.png'));
    
    console.log('✅ Generated favicon.png');
    
    // Generate apple-touch-icon
    const appleTouchPath = path.join(publicDir, 'apple-touch-icon.png');
    await sharp(logoPath)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png({ quality: 90 })
      .toFile(appleTouchPath);
    
    console.log('✅ Generated apple-touch-icon.png');
    
    console.log('\n🎉 All PWA icons generated successfully!');
    console.log('📱 Your app is now ready for installation on mobile devices.');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateIcons();
}

module.exports = { generateIcons };