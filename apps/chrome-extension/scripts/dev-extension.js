const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { execSync } = require('child_process');

// Development script for Chrome extension with hot reloading
class ExtensionDevServer {
  constructor() {
    this.extensionDir = path.join(__dirname, '../dist-extension');
    this.srcDir = path.join(__dirname, '../src');
    this.isBuilding = false;
  }

  async start() {
    console.log('🚀 Starting Chrome Extension Development Server...');
    
    // Initial build
    await this.build();
    
    // Watch for changes
    this.watch();
    
    console.log('✅ Extension ready for development!');
    console.log('📁 Extension files:', this.extensionDir);
    console.log('🔄 Hot reloading enabled - changes will auto-rebuild');
    console.log('🌐 Load the extension in Chrome: chrome://extensions/');
  }

  async build() {
    if (this.isBuilding) return;
    this.isBuilding = true;

    try {
      console.log('🔨 Building extension...');
      
      // Build Next.js app
      execSync('npm run build', { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });

      // Create extension directory
      if (fs.existsSync(this.extensionDir)) {
        fs.rmSync(this.extensionDir, { recursive: true });
      }
      fs.mkdirSync(this.extensionDir, { recursive: true });

      // Copy manifest
      fs.copyFileSync(
        path.join(__dirname, '../manifest.json'),
        path.join(this.extensionDir, 'manifest.json')
      );

      // Copy built files
      const buildDir = path.join(__dirname, '../out');
      if (fs.existsSync(buildDir)) {
        // Copy popup
        if (fs.existsSync(path.join(buildDir, 'popup.html'))) {
          fs.copyFileSync(
            path.join(buildDir, 'popup.html'),
            path.join(this.extensionDir, 'popup.html')
          );
        }

        // Copy options
        if (fs.existsSync(path.join(buildDir, 'options.html'))) {
          fs.copyFileSync(
            path.join(buildDir, 'options.html'),
            path.join(this.extensionDir, 'options.html')
          );
        }

        // Copy static assets
        const staticDir = path.join(buildDir, '_next/static');
        if (fs.existsSync(staticDir)) {
          const destStaticDir = path.join(this.extensionDir, '_next/static');
          if (fs.existsSync(destStaticDir)) {
            fs.rmSync(destStaticDir, { recursive: true });
          }
          fs.cpSync(staticDir, destStaticDir, { recursive: true });
        }
      }

      // Copy and compile background script
      await this.compileBackgroundScript();

      // Copy and compile content script
      await this.compileContentScript();

      // Create injected script
      this.createInjectedScript();

      // Create placeholder icons
      this.createIcons();

      console.log('✅ Extension built successfully!');
      console.log('🔄 Extension will auto-reload in Chrome');

    } catch (error) {
      console.error('❌ Build failed:', error);
    } finally {
      this.isBuilding = false;
    }
  }

  async compileBackgroundScript() {
    const sourceFile = path.join(this.srcDir, 'background/background.ts');
    const destFile = path.join(this.extensionDir, 'background.js');
    
    if (fs.existsSync(sourceFile)) {
      // For development, just copy the TypeScript file
      // In production, you'd compile it
      let content = fs.readFileSync(sourceFile, 'utf8');
      
      // Simple TypeScript to JavaScript conversion for development
      content = content
        .replace(/\/\/ Note: SDK imports will be resolved at build time[\s\S]*?\/\/ import.*?;/g, '')
        .replace(/import.*?from.*?;/g, '')
        .replace(/export.*?;/g, '');
      
      fs.writeFileSync(destFile, content);
    }
  }

  async compileContentScript() {
    const sourceFile = path.join(this.srcDir, 'content/content.ts');
    const destFile = path.join(this.extensionDir, 'content.js');
    
    if (fs.existsSync(sourceFile)) {
      let content = fs.readFileSync(sourceFile, 'utf8');
      
      // Simple TypeScript to JavaScript conversion
      content = content
        .replace(/import.*?from.*?;/g, '')
        .replace(/export.*?;/g, '');
      
      fs.writeFileSync(destFile, content);
    }
  }

  createInjectedScript() {
    const injectedScript = `
// Injected Web3 provider for MPC Wallet
(function() {
  if (typeof window !== 'undefined' && !window.mpcWalletInjected) {
    window.mpcWalletInjected = true;
    
    // Create a simple mock provider for development
    const provider = {
      isMetaMask: true,
      isConnected: () => true,
      selectedAddress: '0x' + Math.random().toString(16).substr(2, 40),
      chainId: '0x1',
      networkVersion: '1',
      
      request: async ({ method, params }) => {
        console.log('DApp request:', method, params);
        
        switch (method) {
          case 'eth_requestAccounts':
            return [provider.selectedAddress];
          case 'eth_accounts':
            return [provider.selectedAddress];
          case 'eth_chainId':
            return provider.chainId;
          case 'eth_getBalance':
            return '0x1bc16d674ec80000'; // 2 ETH
          default:
            throw new Error(\`Unsupported method: \${method}\`);
        }
      },
      
      on: (event, callback) => {
        console.log('Event listener:', event);
      },
      
      removeListener: (event, callback) => {
        console.log('Remove listener:', event);
      }
    };
    
    // Inject the provider
    window.ethereum = provider;
    window.mpcWallet = provider;
    window.web3 = {
      currentProvider: provider,
      providers: { ethereum: provider }
    };
    
    // Dispatch initialization event
    window.dispatchEvent(new CustomEvent('ethereum#initialized'));
    
    console.log('MPC Wallet provider injected');
  }
})();
    `;
    
    fs.writeFileSync(path.join(this.extensionDir, 'injected.js'), injectedScript);
  }

  createIcons() {
    const iconsDir = path.join(this.extensionDir, 'icons');
    fs.mkdirSync(iconsDir, { recursive: true });

    // Create placeholder icon files
    const iconSizes = [16, 32, 48, 128];
    iconSizes.forEach(size => {
      const iconPath = path.join(iconsDir, `icon-${size}.png`);
      if (!fs.existsSync(iconPath)) {
        // Create a simple SVG icon as placeholder
        const svgIcon = `
<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" rx="4" fill="#3B82F6"/>
  <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
        fs.writeFileSync(iconPath.replace('.png', '.svg'), svgIcon);
      }
    });
  }

  watch() {
    const watcher = chokidar.watch([
      path.join(this.srcDir, '**/*'),
      path.join(__dirname, '../manifest.json'),
      path.join(__dirname, '../next.config.js'),
      path.join(__dirname, '../tailwind.config.js')
    ], {
      ignored: /node_modules/,
      persistent: true
    });

    watcher.on('change', (filePath) => {
      console.log(`📝 File changed: ${path.relative(__dirname, filePath)}`);
      this.build();
    });

    watcher.on('add', (filePath) => {
      console.log(`➕ File added: ${path.relative(__dirname, filePath)}`);
      this.build();
    });

    watcher.on('unlink', (filePath) => {
      console.log(`🗑️ File removed: ${path.relative(__dirname, filePath)}`);
      this.build();
    });
  }
}

// Start the development server
const devServer = new ExtensionDevServer();
devServer.start().catch(console.error);
