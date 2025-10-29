# MPC Wallet Chrome Extension

A world-class Chrome extension for Web3 wallet functionality, built with Next.js and leveraging the complete MPC Wallet SDK.

## Features

### 🔐 **Core Wallet Features**
- **Multi-Account Support**: Create, import, and manage multiple accounts
- **Secure Storage**: All data encrypted and stored locally
- **PIN Protection**: Optional PIN-based security
- **Hardware Wallet Support**: Ledger, Trezor, KeepKey, BitBox integration

### 💰 **Transaction Management**
- **Send/Receive**: Easy ETH and token transfers
- **Transaction History**: Complete transaction tracking
- **Gas Optimization**: Smart gas estimation
- **Multi-Network Support**: Ethereum, Polygon, BSC, Arbitrum

### 🌐 **Web3 Integration**
- **DApp Browser**: Built-in browser for Web3 applications
- **Provider Injection**: Seamless DApp connectivity
- **Network Switching**: Easy network management
- **Token Management**: Custom token support

### 🛡️ **Security Features**
- **MPC Technology**: Multi-party computation for enhanced security
- **Biometric Support**: Hardware security key integration
- **Secure Communication**: Encrypted background messaging
- **Private Key Protection**: Never exposed to websites

## Architecture

### **Extension Structure**
```
apps/chrome-extension/
├── src/
│   ├── app/                    # Next.js app pages
│   │   ├── popup/             # Extension popup
│   │   └── options/           # Extension options
│   ├── components/            # React components
│   ├── store/                 # Zustand state management
│   ├── background/            # Background script
│   └── content/               # Content script
├── manifest.json              # Extension manifest
├── next.config.js            # Next.js configuration
└── package.json              # Dependencies
```

### **Key Components**

#### **Popup Interface** (`src/app/popup/`)
- Wallet status and balance
- Quick actions (send/receive)
- Recent transactions
- Network selector
- Account management

#### **Options Page** (`src/app/options/`)
- Account management
- Network configuration
- Security settings
- Token management
- Hardware wallet setup

#### **Background Script** (`src/background/`)
- Extension lifecycle management
- Wallet state persistence
- Transaction processing
- Web3 provider coordination

#### **Content Script** (`src/content/`)
- Web3 provider injection
- DApp communication
- Transaction approval flow
- Network detection

## Development

### **Prerequisites**
- Node.js 18+
- pnpm (recommended)
- Chrome browser for testing

### **Installation**
```bash
# Install dependencies
pnpm install

# Build the extension
pnpm run build:extension

# Package for distribution
pnpm run package
```

### **Development Workflow**
```bash
# Start development server
pnpm run dev

# Build for production
pnpm run build

# Build extension
pnpm run build:extension

# Package extension
pnpm run package
```

### **Testing the Extension**
1. Build the extension: `pnpm run build:extension`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist-extension` folder
5. Test the extension functionality

## SDK Integration

The extension leverages the complete MPC Wallet SDK:

```typescript
import { Wallet, Network, Account } from '@evm-wallet/sdk';

// Initialize wallet
const wallet = new Wallet();
await wallet.initialize();

// Create account
const account = wallet.createAccount('My Account');

// Send transaction
const txHash = await wallet.sendTransaction({
  to: '0x...',
  value: '0.1',
  from: account.address
});
```

## Security

### **Data Protection**
- All sensitive data encrypted at rest
- Private keys never leave the extension
- Secure communication with background script
- No data sent to external servers

### **Permission Model**
- Minimal required permissions
- No unnecessary network access
- Secure storage only
- User-controlled connections

## Deployment

### **Chrome Web Store**
1. Build the extension: `pnpm run build:extension`
2. Package for distribution: `pnpm run package`
3. Upload `mpc-wallet-extension.zip` to Chrome Web Store
4. Complete store listing and review process

### **Manual Distribution**
1. Package the extension: `pnpm run package`
2. Distribute the ZIP file directly
3. Users can install via "Load unpacked" in developer mode

## Browser Support

- **Chrome**: Full support (primary target)
- **Edge**: Compatible (Chromium-based)
- **Brave**: Compatible (Chromium-based)
- **Firefox**: Not supported (different extension API)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Join our community Discord

---

**Built with ❤️ using Next.js, TypeScript, and the MPC Wallet SDK**
