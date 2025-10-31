'use client';

import React, { useEffect, useRef } from 'react';
import { useWalletStore } from '@/store/wallet';

interface Web3ProviderProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ iframeRef }) => {
  const { address, currentNetwork, isUnlocked } = useWalletStore();
  const injectedRef = useRef(false);

  useEffect(() => {
    if (!iframeRef.current || !address || !isUnlocked) return;

    const iframe = iframeRef.current;
    
    const injectWeb3Provider = () => {
      try {
        const iframeWindow = iframe.contentWindow;
        if (!iframeWindow || injectedRef.current) return;

        // Create MetaMask-compatible provider
        const ethereum = {
          isMetaMask: true,
          isConnected: () => !!address,
          chainId: currentNetwork?.chainId ? `0x${currentNetwork.chainId.toString(16)}` : '0x1',
          networkVersion: currentNetwork?.chainId?.toString() || '1',
          
          request: async ({ method, params }: any) => {
            console.log('DApp request:', method, params);
            
            switch (method) {
              case 'eth_requestAccounts':
                return address ? [address] : [];
              case 'eth_accounts':
                return address ? [address] : [];
              case 'eth_chainId':
                return currentNetwork?.chainId ? `0x${currentNetwork.chainId.toString(16)}` : '0x1';
              case 'eth_getBalance':
                // Return a mock balance for now
                return '0x1bc16d674ec80000'; // 2 ETH in wei
              case 'eth_sendTransaction':
                console.log('Transaction request:', params);
                // In a real implementation, this would trigger the wallet's transaction flow
                return '0x1234567890abcdef1234567890abcdef12345678';
              case 'personal_sign':
                console.log('Sign request:', params);
                // In a real implementation, this would trigger the wallet's signing flow
                return '0xabcdef1234567890abcdef1234567890abcdef12';
              case 'eth_signTypedData':
                console.log('Typed data sign request:', params);
                return '0xabcdef1234567890abcdef1234567890abcdef12';
              case 'wallet_addEthereumChain':
                console.log('Add chain request:', params);
                return null;
              case 'wallet_switchEthereumChain':
                console.log('Switch chain request:', params);
                return null;
              default:
                throw new Error(`Unsupported method: ${method}`);
            }
          },
          
          on: (event: string, callback: Function) => {
            console.log('DApp event listener:', event);
            // In a real implementation, this would set up event listeners
          },
          
          removeListener: (event: string, callback: Function) => {
            console.log('DApp remove listener:', event);
            // In a real implementation, this would remove event listeners
          },
          
          // Additional properties for compatibility
          selectedAddress: address,
          isUnlocked: isUnlocked,
          _metamask: {
            isUnlocked: isUnlocked,
            requestBatch: async (requests: any[]) => {
              console.log('Batch request:', requests);
              return requests.map(() => '0x1234567890abcdef');
            }
          }
        };

        // Inject the provider
        (iframeWindow as any).ethereum = ethereum;
        (iframeWindow as any).web3 = { 
          currentProvider: ethereum,
          providers: { ethereum }
        };
        
        // Also inject as window.ethereum for broader compatibility
        if (iframeWindow.parent && iframeWindow.parent !== iframeWindow) {
          (iframeWindow.parent as any).ethereum = ethereum;
        }

        injectedRef.current = true;
        console.log('Web3 provider injected into DApp');
        
        // Dispatch a custom event to notify the DApp
        iframeWindow.dispatchEvent(new CustomEvent('ethereum#initialized'));
        
      } catch (error) {
        console.error('Failed to inject Web3 provider:', error);
      }
    };

    // Try to inject immediately
    injectWeb3Provider();

    // Also try after a delay in case the iframe content loads later
    const timeout = setTimeout(injectWeb3Provider, 1000);

    return () => {
      clearTimeout(timeout);
      injectedRef.current = false;
    };
  }, [address, currentNetwork, isUnlocked, iframeRef]);

  // Reset injection flag when address changes
  useEffect(() => {
    injectedRef.current = false;
  }, [address]);

  return null; // This component doesn't render anything
};
