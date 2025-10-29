
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
            throw new Error(`Unsupported method: ${method}`);
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
    