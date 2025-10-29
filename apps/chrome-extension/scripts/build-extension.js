const fs = require('fs');
const path = require('path');

// Build script for Chrome extension
async function buildExtension() {
  console.log('Building Chrome extension...');

  try {
    // Build Next.js app
    console.log('Building Next.js app...');
    const { execSync } = require('child_process');
    execSync('npm run build', { stdio: 'inherit' });

    // Create extension directory structure
    const extensionDir = path.join(__dirname, '../dist-extension');
    if (fs.existsSync(extensionDir)) {
      fs.rmSync(extensionDir, { recursive: true });
    }
    fs.mkdirSync(extensionDir, { recursive: true });

    // Copy manifest
    fs.copyFileSync(
      path.join(__dirname, '../manifest.json'),
      path.join(extensionDir, 'manifest.json')
    );

    // Copy icons
    const iconsDir = path.join(extensionDir, 'icons');
    fs.mkdirSync(iconsDir, { recursive: true });
    
    const iconSizes = [16, 32, 48, 128];
    iconSizes.forEach(size => {
      const sourceIcon = path.join(__dirname, '../public/icons', `icon-${size}.png`);
      const destIcon = path.join(iconsDir, `icon-${size}.png`);
      if (fs.existsSync(sourceIcon)) {
        fs.copyFileSync(sourceIcon, destIcon);
        console.log(`Copied icon-${size}.png`);
      }
    });

    // Copy HTML files from src
    const srcDir = path.join(__dirname, '../src');
    
    // Copy popup
    const popupSource = path.join(srcDir, 'popup.html');
    const popupDest = path.join(extensionDir, 'popup.html');
    if (fs.existsSync(popupSource)) {
      fs.copyFileSync(popupSource, popupDest);
      console.log('Copied popup.html');
    }

    // Copy options
    const optionsSource = path.join(srcDir, 'options.html');
    const optionsDest = path.join(extensionDir, 'options.html');
    if (fs.existsSync(optionsSource)) {
      fs.copyFileSync(optionsSource, optionsDest);
      console.log('Copied options.html');
    }

    // Copy setup
    const setupSource = path.join(srcDir, 'setup.html');
    const setupDest = path.join(extensionDir, 'setup.html');
    if (fs.existsSync(setupSource)) {
      fs.copyFileSync(setupSource, setupDest);
      console.log('Copied setup.html');
    }

      // Copy static assets (rename _next to next to avoid Chrome restrictions)
      const staticDir = path.join(buildDir, '_next/static');
      if (fs.existsSync(staticDir)) {
        // Create the next directory first
        const nextDir = path.join(extensionDir, 'next');
        if (!fs.existsSync(nextDir)) {
          fs.mkdirSync(nextDir, { recursive: true });
        }
        // Copy only the contents of static, not the _next directory itself
        const nextStaticDir = path.join(nextDir, 'static');
        if (!fs.existsSync(nextStaticDir)) {
          fs.mkdirSync(nextStaticDir, { recursive: true });
        }
        // Copy files individually to avoid copying _next directories
        const files = fs.readdirSync(staticDir);
        for (const file of files) {
          const sourcePath = path.join(staticDir, file);
          const destPath = path.join(nextStaticDir, file);
          if (fs.statSync(sourcePath).isDirectory()) {
            // Skip any directories that start with _
            if (!file.startsWith('_')) {
              fs.cpSync(sourcePath, destPath, { recursive: true });
            }
          } else {
            fs.copyFileSync(sourcePath, destPath);
          }
        }
        console.log('Copied static assets to next/static');
      }

      // Remove any _next directory that might have been copied (Chrome restriction)
      const underscoreNextDir = path.join(extensionDir, '_next');
      if (fs.existsSync(underscoreNextDir)) {
        fs.rmSync(underscoreNextDir, { recursive: true, force: true });
        console.log('Removed _next directory (Chrome restriction)');
      }

      // Fix HTML file paths to use 'next' instead of '_next'
      const popupHtmlPath = path.join(extensionDir, 'popup.html');
      const optionsHtmlPath = path.join(extensionDir, 'options.html');
      
      if (fs.existsSync(popupHtmlPath)) {
        let popupContent = fs.readFileSync(popupHtmlPath, 'utf8');
        popupContent = popupContent.replace(/_next\//g, 'next/');
        // Remove ALL inline scripts to avoid CSP issues
        popupContent = popupContent.replace(/<script>[\s\S]*?<\/script>/g, '');
        
        // Add a simple unlock button handler for testing
        const unlockScript = `
<script>
document.addEventListener('DOMContentLoaded', function() {
  const unlockButton = document.querySelector('.wallet-button');
  if (unlockButton) {
    unlockButton.addEventListener('click', function() {
      console.log('Unlock button clicked!');
      // Simple unlock for testing
      const modal = document.createElement('div');
      modal.innerHTML = \`
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
          <div style="background: white; padding: 20px; border-radius: 8px; max-width: 400px; width: 90%;">
            <h2 style="margin: 0 0 15px 0;">Unlock Wallet</h2>
            <input type="password" id="password" placeholder="Enter password" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px;">
            <div style="display: flex; gap: 10px;">
              <button id="cancel" style="flex: 1; padding: 10px; background: #f0f0f0; border: none; border-radius: 4px;">Cancel</button>
              <button id="unlock" style="flex: 1; padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px;">Unlock</button>
            </div>
          </div>
        </div>
      \`;
      document.body.appendChild(modal);
      
      document.getElementById('cancel').addEventListener('click', () => {
        document.body.removeChild(modal);
      });
      
      document.getElementById('unlock').addEventListener('click', () => {
        const password = document.getElementById('password').value;
        if (password) {
          console.log('Unlocking with password:', password);
          // Simulate unlock
          setTimeout(() => {
            document.body.removeChild(modal);
            // Show unlocked state
            document.querySelector('.extension-popup').innerHTML = \`
              <div class="bg-white border-b border-gray-200 px-4 py-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                      </svg>
                    </div>
                    <div>
                      <h1 class="text-lg font-bold text-gray-900">MPC Wallet</h1>
                      <p class="text-xs text-gray-500">Professional Web3</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="p-4">
                <div class="text-center">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Wallet Unlocked!</h3>
                  <p class="text-gray-600 mb-4">Address: 0x1234...5678</p>
                  <p class="text-gray-600 mb-4">Balance: 1.5 ETH</p>
                  <button class="wallet-button" onclick="alert('Send functionality coming soon!')">Send</button>
                  <button class="wallet-button" onclick="alert('Receive functionality coming soon!')" style="margin-left: 10px;">Receive</button>
                </div>
              </div>
            \`;
          }, 500);
        } else {
          alert('Please enter a password');
        }
      });
    });
  }
});
</script>
        `;
        
        popupContent = popupContent.replace('</body>', unlockScript + '</body>');
        fs.writeFileSync(popupHtmlPath, popupContent);
        console.log('Fixed popup.html paths and added unlock functionality');
      }
      
      if (fs.existsSync(optionsHtmlPath)) {
        let optionsContent = fs.readFileSync(optionsHtmlPath, 'utf8');
        optionsContent = optionsContent.replace(/_next\//g, 'next/');
        // Remove ALL inline scripts to avoid CSP issues
        optionsContent = optionsContent.replace(/<script>[\s\S]*?<\/script>/g, '');
        fs.writeFileSync(optionsHtmlPath, optionsContent);
        console.log('Fixed options.html paths and removed ALL inline scripts');
      }
    }

    // Copy background script
    const backgroundSource = path.join(__dirname, '../src/background/background-simple.js');
    const backgroundDest = path.join(extensionDir, 'background.js');
    
    if (fs.existsSync(backgroundSource)) {
      fs.copyFileSync(backgroundSource, backgroundDest);
      console.log('Copied background script');
    }

    // Copy content script
    const contentSource = path.join(__dirname, '../src/content/content-simple.js');
    const contentDest = path.join(extensionDir, 'content.js');
    
    if (fs.existsSync(contentSource)) {
      fs.copyFileSync(contentSource, contentDest);
      console.log('Copied content script');
    }

    // Copy wallet service
    const walletServiceSource = path.join(__dirname, '../src/scripts/wallet-service.js');
    const walletServiceDest = path.join(extensionDir, 'wallet-service.js');
    
    if (fs.existsSync(walletServiceSource)) {
      fs.copyFileSync(walletServiceSource, walletServiceDest);
      console.log('Copied wallet service');
    }

    // Copy setup script
    const setupSource = path.join(__dirname, '../src/scripts/setup.js');
    const setupDest = path.join(extensionDir, 'setup.js');
    
    if (fs.existsSync(setupSource)) {
      fs.copyFileSync(setupSource, setupDest);
      console.log('Copied setup script');
    }

    // Create injected script
    const injectedScript = `
// Injected Web3 provider for MPC Wallet
(function() {
  if (typeof window !== 'undefined' && !window.mpcWalletInjected) {
    window.mpcWalletInjected = true;
    
    // This will be replaced with the actual provider injection
    console.log('MPC Wallet provider ready');
  }
})();
    `;
    
    fs.writeFileSync(path.join(extensionDir, 'injected.js'), injectedScript);

    // Copy SDK files
    console.log('Copying SDK files...');
    const sdkSourceDir = path.join(__dirname, '../../../packages/sdk/dist');
    const sdkDestDir = path.join(extensionDir, 'sdk');
    
    if (fs.existsSync(sdkSourceDir)) {
      // Create SDK directory
      if (!fs.existsSync(sdkDestDir)) {
        fs.mkdirSync(sdkDestDir, { recursive: true });
      }
      
      // Copy all SDK files
      const copyRecursive = (src, dest) => {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        
        const items = fs.readdirSync(src);
        for (const item of items) {
          const srcPath = path.join(src, item);
          const destPath = path.join(dest, item);
          
          if (fs.statSync(srcPath).isDirectory()) {
            copyRecursive(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };
      
      copyRecursive(sdkSourceDir, sdkDestDir);
      console.log('✅ SDK files copied successfully');
    } else {
      console.warn('⚠️  SDK source directory not found:', sdkSourceDir);
    }

    // Icons are already copied above

    // Final cleanup - ensure no _next directory exists (Chrome restriction)
    const finalUnderscoreNextDir = path.join(extensionDir, '_next');
    if (fs.existsSync(finalUnderscoreNextDir)) {
      fs.rmSync(finalUnderscoreNextDir, { recursive: true, force: true });
      console.log('Final cleanup: Removed _next directory');
    }

    // Additional cleanup - remove any _next directories that might exist anywhere
    const allUnderscoreNextDirs = [
      path.join(extensionDir, '_next'),
      path.join(extensionDir, 'next', '_next'),
      path.join(extensionDir, 'next', 'static', '_next')
    ];
    
    allUnderscoreNextDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`Removed _next directory: ${dir}`);
      }
    });

    // Recursive cleanup - find and remove any _next directories anywhere in the extension
    function removeUnderscoreDirs(dir) {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        if (fs.statSync(itemPath).isDirectory()) {
          if (item.startsWith('_')) {
            fs.rmSync(itemPath, { recursive: true, force: true });
            console.log(`Recursively removed _next directory: ${itemPath}`);
          } else {
            removeUnderscoreDirs(itemPath);
          }
        }
      }
    }
    
    removeUnderscoreDirs(extensionDir);

    console.log('✅ Chrome extension built successfully!');
    console.log(`📁 Extension files: ${extensionDir}`);
    console.log('📦 Ready to load in Chrome developer mode');

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildExtension();
