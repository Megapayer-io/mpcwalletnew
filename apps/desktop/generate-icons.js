const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const iconsDir = path.join(__dirname, 'src-tauri', 'icons');
const svgPath = path.join(iconsDir, 'icon.svg');
const pngSourcePath = path.join(iconsDir, 'icon-source.png');

console.log('Current directory:', __dirname);
console.log('Icons directory:', iconsDir);
console.log('SVG path:', svgPath);

// Convert SVG to 1024x1024 PNG (Tauri icon generator needs this)
async function generateIcons() {
  try {
    console.log('Converting SVG to PNG source...');
    await sharp(svgPath)
      .resize(1024, 1024, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(pngSourcePath);
    
    console.log('✅ Created PNG source at:', pngSourcePath);
    console.log('Now running Tauri icon generator...');
    
    // Use Tauri CLI to generate all icon formats
    execSync('npx tauri icon "' + pngSourcePath + '"', {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    console.log('✅ All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

