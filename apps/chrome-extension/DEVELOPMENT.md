# Chrome Extension Development Guide

## 🚀 Real-Time Development Setup

### **Quick Start**
```bash
# Navigate to extension directory
cd apps/chrome-extension

# Install dependencies
pnpm install

# Start development server with hot reloading
pnpm run dev:extension
```

### **Development Workflow**

#### **1. Start Development Server**
```bash
pnpm run dev:extension
```
This will:
- ✅ Build the extension automatically
- 🔄 Watch for file changes
- 🔄 Auto-rebuild on changes
- 📁 Output to `dist-extension/`

#### **2. Load Extension in Chrome**
1. Open Chrome and go to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top right)
3. Click **"Load unpacked"**
4. Select the `apps/chrome-extension/dist-extension/` folder
5. The extension will appear in your extensions list

#### **3. Test the Extension**
- **Popup**: Click the extension icon in Chrome toolbar
- **Options**: Right-click extension icon → Options
- **DApp Integration**: Visit any Web3 site (like Uniswap)

### **Hot Reloading in Chrome**

#### **Automatic Reload**
The development server watches for changes and rebuilds automatically. To reload in Chrome:

1. **Manual Reload**: Go to `chrome://extensions/` → Click reload button on your extension
2. **Auto-Reload Extension**: Install "Extensions Reloader" Chrome extension for automatic reloading

#### **Development Tips**
```bash
# Watch specific files
pnpm run dev:extension

# Check build output
ls -la dist-extension/

# View extension logs
# Open Chrome DevTools → Console → Filter by "MPC Wallet"
```

### **File Structure for Development**

```
apps/chrome-extension/
├── src/
│   ├── app/
│   │   ├── popup/page.tsx          # Extension popup
│   │   └── options/page.tsx        # Extension options
│   ├── components/extension/        # Extension-specific components
│   ├── store/wallet.ts             # State management
│   ├── background/background.ts    # Background script
│   └── content/content.ts          # Content script
├── dist-extension/                 # Built extension (auto-generated)
├── manifest.json                   # Extension manifest
└── scripts/dev-extension.js       # Development server
```

### **Development Features**

#### **Mock Data for Development**
- **Wallet State**: Mock accounts, balances, transactions
- **Network Support**: Ethereum, Polygon, BSC, Arbitrum
- **Transaction Simulation**: Mock transaction hashes
- **DApp Integration**: Mock Web3 provider injection

#### **Real-Time Testing**
- **Popup Interface**: Test wallet UI components
- **Options Page**: Test settings and configuration
- **DApp Interaction**: Test Web3 provider injection
- **Background Script**: Test extension lifecycle

### **Debugging**

#### **Chrome DevTools**
1. **Popup Debugging**: Right-click extension icon → Inspect popup
2. **Options Debugging**: Right-click extension icon → Inspect options
3. **Background Script**: Go to `chrome://extensions/` → Details → Inspect views: background page
4. **Content Script**: Open any webpage → DevTools → Console

#### **Console Logs**
```javascript
// Background script logs
console.log('Background script loaded');

// Content script logs  
console.log('Content script injected');

// Popup logs
console.log('Popup component mounted');
```

### **Common Development Tasks**

#### **Adding New Components**
1. Create component in `src/components/extension/`
2. Import in popup or options page
3. Extension auto-rebuilds
4. Reload extension in Chrome

#### **Modifying Background Script**
1. Edit `src/background/background.ts`
2. Development server rebuilds automatically
3. Reload extension in Chrome
4. Test in background page DevTools

#### **Updating Content Script**
1. Edit `src/content/content.ts`
2. Development server rebuilds automatically
3. Reload extension in Chrome
4. Test on any webpage

### **Production Build**

#### **Build for Production**
```bash
# Build extension
pnpm run build:extension

# Package for distribution
pnpm run package
```

#### **Chrome Web Store**
1. Build extension: `pnpm run build:extension`
2. Package: `pnpm run package`
3. Upload `mpc-wallet-extension.zip` to Chrome Web Store

### **Troubleshooting**

#### **Extension Not Loading**
- Check `chrome://extensions/` for errors
- Verify manifest.json syntax
- Check console for JavaScript errors

#### **Hot Reload Not Working**
- Restart development server: `pnpm run dev:extension`
- Clear Chrome extension cache
- Reload extension manually

#### **Build Errors**
- Check TypeScript errors: `pnpm run lint`
- Verify all imports are correct
- Check file paths in manifest.json

### **Development Best Practices**

#### **File Organization**
- Keep components in `src/components/extension/`
- Use TypeScript for type safety
- Follow React best practices
- Use Tailwind CSS for styling

#### **State Management**
- Use Zustand for global state
- Persist important data to chrome.storage
- Handle async operations properly

#### **Security**
- Never expose private keys
- Validate all user inputs
- Use secure communication between scripts
- Follow Chrome extension security guidelines

---

## 🎯 **Quick Commands**

```bash
# Start development
pnpm run dev:extension

# Build production
pnpm run build:extension

# Package for store
pnpm run package

# Lint code
pnpm run lint
```

**Happy coding! 🚀**
