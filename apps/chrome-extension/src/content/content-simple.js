// Content script for MPC Wallet Chrome Extension

// Web3 Provider Injection
class MPCWalletProvider {
  constructor() {
    this.connected = false;
    this.address = null;
    this.chain = '0x1'; // Ethereum mainnet
    this.network = '1';
    this.initializeProvider();
  }

  async initializeProvider() {
    // Get wallet state from background script
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_WALLET_STATE' });
      if (response.success && response.data.isUnlocked) {
        this.connected = true;
        this.address = response.data.address;
        this.chain = response.data.currentNetwork?.chainId ? 
          `0x${response.data.currentNetwork.chainId.toString(16)}` : '0x1';
        this.network = response.data.currentNetwork?.chainId?.toString() || '1';
      }
    } catch (error) {
      console.error('Failed to get wallet state:', error);
    }
  }

  // EIP-1193 Provider Interface
  get isMetaMask() {
    return true; // For compatibility
  }

  get selectedAddress() {
    return this.address;
  }

  get chainId() {
    return this.chain;
  }

  get networkVersion() {
    return this.network;
  }

  get isConnected() {
    return this.connected;
  }

  // Request method for DApp interactions
  async request({ method, params }) {
    console.log('DApp request:', method, params);

    try {
      switch (method) {
        case 'eth_requestAccounts':
          if (!this.isConnected) {
            throw new Error('Wallet not connected');
          }
          return this.address ? [this.address] : [];

        case 'eth_accounts':
          return this.address ? [this.address] : [];

        case 'eth_chainId':
          return this.chainId;

        case 'eth_getBalance':
          if (!this.address) {
            throw new Error('No account selected');
          }
          const balanceResponse = await chrome.runtime.sendMessage({
            type: 'GET_BALANCE',
            address: this.address
          });
          return balanceResponse.success ? balanceResponse.data : '0x0';

        case 'eth_sendTransaction':
          if (!this.address) {
            throw new Error('No account selected');
          }
          
          const txResponse = await chrome.runtime.sendMessage({
            type: 'SEND_TRANSACTION',
            transaction: {
              from: this.address,
              to: params?.[0]?.to,
              value: params?.[0]?.value,
              data: params?.[0]?.data
            }
          });

          if (!txResponse.success) {
            throw new Error(txResponse.data?.error || 'Transaction failed');
          }

          return txResponse.data.txHash;

        case 'personal_sign':
          // Implement personal signing
          return '0x' + '0'.repeat(130); // Mock signature

        case 'eth_signTypedData':
          // Implement typed data signing
          return '0x' + '0'.repeat(130); // Mock signature

        case 'wallet_addEthereumChain':
          // Handle chain addition
          console.log('Add chain request:', params);
          return null;

        case 'wallet_switchEthereumChain':
          // Handle chain switching
          console.log('Switch chain request:', params);
          return null;

        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    } catch (error) {
      console.error('Provider request error:', error);
      throw error;
    }
  }

  // Event handling
  on(event, callback) {
    console.log('Event listener added:', event);
    // Implement event handling if needed
  }

  removeListener(event, callback) {
    console.log('Event listener removed:', event);
    // Implement event removal if needed
  }

  // Additional methods for compatibility
  async enable() {
    return this.request({ method: 'eth_requestAccounts' });
  }
}

// Inject the provider into the page
function injectProvider() {
  // Only inject if not already present
  if (typeof window !== 'undefined' && !window.mpcWallet) {
    const provider = new MPCWalletProvider();
    
    // Inject as ethereum provider
    window.ethereum = provider;
    window.mpcWallet = provider;
    
    // Also inject as web3 for older DApps
    window.web3 = {
      currentProvider: provider,
      providers: { ethereum: provider }
    };

    // Dispatch initialization event
    window.dispatchEvent(new CustomEvent('ethereum#initialized'));
    
    console.log('MPC Wallet provider injected');
  }
}

// Initialize provider injection
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectProvider);
} else {
  injectProvider();
}

// Handle page navigation (for SPAs)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    // Re-inject provider if needed
    setTimeout(injectProvider, 100);
  }
}).observe(document, { subtree: true, childList: true });

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'INJECT_WEB3_PROVIDER') {
    injectProvider();
    sendResponse({ success: true });
  }
});

// Notify background script that content script is ready
chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_READY' });
