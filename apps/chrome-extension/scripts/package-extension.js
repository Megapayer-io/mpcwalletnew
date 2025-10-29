const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Package extension for distribution
async function packageExtension() {
  console.log('Packaging Chrome extension...');

  try {
    const extensionDir = path.join(__dirname, '../dist-extension');
    const packagePath = path.join(__dirname, '../mpc-wallet-extension.zip');

    // Check if extension directory exists
    if (!fs.existsSync(extensionDir)) {
      console.error('Extension directory not found. Run build first.');
      process.exit(1);
    }

    // Create zip file
    const output = fs.createWriteStream(packagePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log('✅ Extension packaged successfully!');
      console.log(`📦 Package: ${packagePath}`);
      console.log(`📊 Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);
    archive.directory(extensionDir, false);
    await archive.finalize();

  } catch (error) {
    console.error('❌ Packaging failed:', error);
    process.exit(1);
  }
}

packageExtension();
