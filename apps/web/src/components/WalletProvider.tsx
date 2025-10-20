'use client';

import { useEffect } from 'react';
import { useWalletStore } from '@/store/wallet';

// This component injects the wallet provider into the page for DApp interactions
export function WalletProvider() {
  const { address, currentNetwork, isUnlocked, sendEth, sendErc20 } = useWalletStore();

  useEffect(() => {
    // Inject wallet provider into the window object for DApp compatibility
    if (typeof window !== 'undefined') {
      // Create a mock MetaMask-like provider
      const provider = {
        isMetaMask: true,
        isConnected: () => isUnlocked && !!address,
        selectedAddress: address,
        chainId: currentNetwork ? `0x${currentNetwork.chainId.toString(16)}` : '0x1',
        networkVersion: currentNetwork?.chainId.toString() || '1',
        
        // Request account access
        request: async ({ method, params }: { method: string; params?: any[] }) => {
          console.log('DApp request:', method, params);
          
          switch (method) {
            case 'eth_requestAccounts':
              if (!isUnlocked || !address) {
                throw new Error('Please unlock your wallet first');
              }
              return [address];
              
            case 'eth_accounts':
              return address ? [address] : [];
              
            case 'eth_chainId':
              return currentNetwork ? `0x${currentNetwork.chainId.toString(16)}` : '0x1';
              
            case 'eth_getBalance':
              // This would need to be implemented with actual balance fetching
              return '0x0';
              
            case 'eth_sendTransaction':
              if (!isUnlocked || !address) {
                throw new Error('Please unlock your wallet first');
              }
              
              const txParams = params?.[0];
              if (!txParams) {
                throw new Error('Invalid transaction parameters');
              }
              
              try {
                // Handle ETH transaction
                if (!txParams.data || txParams.data === '0x') {
                  const hash = await sendEth({
                    to: txParams.to,
                    valueEth: txParams.value ? (parseInt(txParams.value, 16) / 1e18).toString() : '0'
                  });
                  return hash;
                } else {
                  // Handle contract interaction (would need more complex handling)
                  throw new Error('Contract interactions not yet supported');
                }
              } catch (error) {
                throw new Error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
              }
              
            case 'personal_sign':
            case 'eth_sign':
              // Sign message functionality
              throw new Error('Message signing not yet implemented');
              
            case 'wallet_switchEthereumChain':
              // Network switching
              throw new Error('Network switching not yet implemented');
              
            case 'wallet_addEthereumChain':
              // Add network
              throw new Error('Adding networks not yet implemented');
              
            default:
              throw new Error(`Unsupported method: ${method}`);
          }
        },
        
        // Event listeners for DApp compatibility
        on: (event: string, callback: Function) => {
          console.log('DApp listening for event:', event);
          // Store listeners for future implementation
        },
        
        removeListener: (event: string, callback: Function) => {
          console.log('DApp removing listener for event:', event);
        },
        
        // Network and account change events
        emit: (event: string, ...args: any[]) => {
          console.log('DApp event emitted:', event, args);
        }
      };

      // Inject into window.ethereum
      (window as any).ethereum = provider;
      
      // Also inject as window.web3 for older DApps
      (window as any).web3 = {
        currentProvider: provider,
        eth: {
          accounts: address ? [address] : [],
          defaultAccount: address || null,
          getAccounts: (callback: Function) => {
            callback(null, address ? [address] : []);
          }
        }
      };

      console.log('Wallet provider injected for DApp compatibility');
    }

    return () => {
      // Cleanup on unmount
      if (typeof window !== 'undefined') {
        delete (window as any).ethereum;
        delete (window as any).web3;
      }
    };
  }, [address, currentNetwork, isUnlocked, sendEth, sendErc20]);

  return null; // This component doesn't render anything
}
