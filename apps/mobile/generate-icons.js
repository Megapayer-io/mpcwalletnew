/**
 * Script to generate Android app icons from Megapayer logo
 * 
 * This script requires sharp to be installed:
 * npm install --save-dev sharp
 * 
 * Usage: node generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Error: sharp is not installed. Please run: npm install --save-dev sharp');
  process.exit(1);
}

const logoPath = path.join(__dirname, 'public', 'ettios-logo.png');
const outputDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

// Android icon sizes (in dp, converted to px at mdpi = 1x)
const iconSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

// Background color (light theme matching Ettios brand silver coin)
const backgroundColor = '#ffffff';

async function generateIcons() {
  if (!fs.existsSync(logoPath)) {
    console.error(`Logo not found at: ${logoPath}`);
    process.exit(1);
  }

  console.log('Generating Android app icons from Megapayer logo...\n');

  // Read SVG
  const svgBuffer = fs.readFileSync(logoPath);

  for (const [folder, size] of Object.entries(iconSizes)) {
    const folderPath = path.join(outputDir, folder);
    
    // Ensure directory exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const outputPath = path.join(folderPath, 'ic_launcher.png');
    const outputPathRound = path.join(folderPath, 'ic_launcher_round.png');
    const outputPathForeground = path.join(folderPath, 'ic_launcher_foreground.png');

    try {
      // Generate square icon
      const logoSize = Math.round(size * 0.7);
      const padding = Math.round(size * 0.15);
      
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: backgroundColor
        }
      })
      .composite([
        {
          input: await sharp(svgBuffer)
            .resize(logoSize, logoSize, { fit: 'contain' })
            .toBuffer(),
          top: padding,
          left: padding,
          blend: 'over'
        }
      ])
      .png()
      .toFile(outputPath);

      // Generate round icon (same as square for now, Android will apply mask)
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: backgroundColor
        }
      })
      .composite([
        {
          input: await sharp(svgBuffer)
            .resize(logoSize, logoSize, { fit: 'contain' })
            .toBuffer(),
          top: padding,
          left: padding,
          blend: 'over'
        }
      ])
      .png()
      .toFile(outputPathRound);

      // Generate foreground icon (for adaptive icons) - larger logo, transparent background
      await sharp(svgBuffer)
        .resize(Math.round(size * 0.7), Math.round(size * 0.7))
        .extend({
          top: Math.round(size * 0.15),
          bottom: Math.round(size * 0.15),
          left: Math.round(size * 0.15),
          right: Math.round(size * 0.15),
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPathForeground);

      console.log(`✓ Generated icons for ${folder} (${size}x${size}px)`);
    } catch (error) {
      console.error(`✗ Error generating icons for ${folder}:`, error.message);
    }
  }

  console.log('\n✓ All icons generated successfully!');
  console.log('\nNext steps:');
  console.log('1. Rebuild the app: npm run build && npx cap sync');
  console.log('2. Build APK: cd android && .\\gradlew.bat assembleDebug');
}

generateIcons().catch(console.error);

