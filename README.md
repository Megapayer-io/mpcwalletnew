# EVM Wallet

A minimal, secure EVM wallet built with Next.js 14, TypeScript, and modern web technologies. This wallet provides a clean interface for managing Ethereum and EVM-compatible blockchain networks with strong security practices.

## Features

- 🔐 **Secure Wallet Management**: Create new wallets or import existing ones using BIP39 mnemonic phrases
- 🔒 **Encrypted Storage**: Private keys are encrypted using AES-GCM and stored securely in browser localStorage
- 🌐 **Multi-Network Support**: Built-in support for Ethereum, BSC, Polygon, and Sepolia testnet
- 🎯 **Custom Networks**: Add and manage custom EVM-compatible networks
- 💰 **Token Management**: Send native tokens and ERC-20 tokens
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS
- 🧪 **Test Coverage**: Comprehensive test suite for the SDK

## Architecture

This is a monorepo built with pnpm workspaces:

- **`apps/web`**: Next.js 14 application with App Router
- **`packages/sdk`**: TypeScript utility library for wallet operations

## Security Features

- **Never stores plaintext private keys or mnemonics**
- **Uses Web Crypto API for encryption (AES-GCM)**
- **Scrypt key derivation for password hashing**
- **Client-side only operations** (no server-side key handling)
- **Automatic wallet locking** on page refresh
- **Secure random number generation**

## Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm 8+

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd evm-wallet
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cd apps/web
   cp env.example .env.local
   ```

3. **Configure your RPC endpoints:**
   Edit `.env.local` and update the RPC URLs:
   ```env
   NEXT_PUBLIC_DEFAULT_RPC=https://sepolia.infura.io/v3/your-project-id
   NEXT_PUBLIC_DEFAULT_CHAIN_ID=11155111
   ```

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Creating a New Wallet

1. Navigate to `/setup`
2. Click "Create New Wallet"
3. **Important**: Securely backup your 12-word seed phrase
4. Set a strong password to encrypt your wallet
5. Your wallet is now ready to use!

### Importing an Existing Wallet

1. Navigate to `/setup`
2. Click "Import Existing Wallet"
3. Enter your 12-word seed phrase
4. Set a password to encrypt your wallet

### Managing Networks

1. Navigate to `/networks`
2. View available networks and select the active one
3. Add custom networks by providing:
   - Chain ID
   - Network name
   - RPC URL
   - Currency symbol
   - Block explorer URL (optional)

### Sending Transactions

1. Navigate to `/send`
2. Choose between sending native tokens or ERC-20 tokens
3. Enter recipient address and amount
4. Confirm the transaction

### Adding Custom Tokens

1. On the Dashboard, click "Add Token" in the Token List
2. Provide the token contract address, symbol, and decimals
3. The token will be added to your list with current balance

## Configuration

### Default Networks

The wallet comes with these pre-configured networks:

- **Ethereum Mainnet** (Chain ID: 1)
- **BNB Smart Chain** (Chain ID: 56) 
- **Polygon** (Chain ID: 137)
- **Sepolia Testnet** (Chain ID: 11155111)

### Changing Default Chain

To change the default network:

1. Update `NEXT_PUBLIC_DEFAULT_CHAIN_ID` in `.env.local`
2. Update `NEXT_PUBLIC_DEFAULT_RPC` with the corresponding RPC URL
3. Restart the development server

### Adding Custom RPC Providers

You can use various RPC providers:

- **Infura**: `https://mainnet.infura.io/v3/YOUR_PROJECT_ID`
- **Alchemy**: `https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY`
- **Public RPCs**: `https://eth.llamarpc.com`

## Development

### Project Structure

```
evm-wallet/
├── apps/
│   └── web/                 # Next.js application
│       ├── src/
│       │   ├── app/         # App Router pages
│       │   ├── components/  # React components
│       │   ├── lib/         # Utilities and configurations
│       │   └── store/       # Zustand state management
│       └── package.json
├── packages/
│   └── sdk/                 # Wallet SDK
│       ├── src/
│       │   ├── __tests__/   # Test files
│       │   ├── crypto.ts    # Encryption utilities
│       │   ├── networks.ts  # Network management
│       │   ├── wallet.ts    # Core wallet logic
│       │   └── types.ts     # TypeScript types
│       └── package.json
├── package.json             # Root package.json
├── pnpm-workspace.yaml      # Workspace configuration
└── turbo.json              # Build configuration
```

### Available Scripts

From the root directory:

```bash
# Development
pnpm dev          # Start web app in development mode

# Building
pnpm build        # Build all packages

# Testing
pnpm test         # Run all tests
pnpm test:watch   # Run tests in watch mode

# Linting
pnpm lint         # Lint all packages
pnpm typecheck    # Type check all packages
```

### SDK Development

The SDK package (`packages/sdk`) provides the core wallet functionality:

```typescript
import { EvmWallet } from '@evm-wallet/sdk';

const wallet = new EvmWallet();

// Create a new wallet
const { mnemonic, address } = await wallet.createWallet();

// Import from mnemonic
await wallet.importFromMnemonic('your twelve word mnemonic phrase...');

// Encrypt and save
await wallet.saveKeystore(mnemonic, 'your-password');

// Unlock wallet
await wallet.unlock('your-password');

// Send ETH
const hash = await wallet.sendEth({
  to: '0x...',
  valueEth: '0.1'
});
```

## Security Considerations

### What This Wallet Does

✅ **Secure**: Uses industry-standard encryption (AES-GCM)  
✅ **Private**: All operations happen client-side  
✅ **Open Source**: Code is auditable and transparent  
✅ **Standards Compliant**: Uses BIP39 for mnemonic generation  

### What This Wallet Doesn't Do

❌ **No Server Storage**: Private keys never leave your browser  
❌ **No Analytics**: No tracking of your wallet activities  
❌ **No Third-Party Dependencies**: For critical crypto operations  
❌ **No Plaintext Storage**: Everything is encrypted  

### Best Practices

1. **Always backup your seed phrase** in a secure, offline location
2. **Use a strong, unique password** for wallet encryption
3. **Verify recipient addresses** before sending transactions
4. **Test with small amounts** on testnets first
5. **Keep your browser updated** for security patches
6. **Never share your seed phrase** with anyone

## Testing

The SDK includes comprehensive tests:

```bash
cd packages/sdk
pnpm test
```

Tests cover:
- Wallet creation and import
- Encryption/decryption
- Network management
- Balance queries
- Transaction sending

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the existing GitHub issues
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

## Roadmap

- [ ] Hardware wallet integration (Ledger/WebHID)
- [ ] Multi-signature wallet support
- [ ] DeFi protocol integrations
- [ ] Mobile app (React Native)
- [ ] Advanced transaction features (gas optimization)
- [ ] WalletConnect integration

---

**⚠️ Disclaimer**: This is experimental software. Use at your own risk. Always test with small amounts and never use for large sums without thorough testing.
