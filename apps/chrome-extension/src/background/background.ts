// Background script for MPC Wallet Chrome Extension

// Note: SDK imports will be resolved at build time
// import { Wallet } from '@evm-wallet/sdk';

// Extension lifecycle
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // First time installation
    console.log('MPC Wallet extension installed');
    
    // Set default settings
    await chrome.storage.local.set({
      isFirstInstall: true,
      connectedSites: [],
      recentTransactions: []
    });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup automatically due to manifest configuration
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // Keep message channel open for async responses
});

async function handleMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
  try {
    switch (message.type) {
      case 'GET_WALLET_STATE':
        const walletState = await getWalletState();
        sendResponse({ success: true, data: walletState });
        break;

      case 'UNLOCK_WALLET':
        const unlockResult = await unlockWallet(message.password);
        sendResponse({ success: unlockResult.success, data: unlockResult.data });
        break;

      case 'LOCK_WALLET':
        await lockWallet();
        sendResponse({ success: true });
        break;

      case 'SEND_TRANSACTION':
        const txResult = await sendTransaction(message.transaction);
        sendResponse({ success: txResult.success, data: txResult.data });
        break;

      case 'GET_BALANCE':
        const balance = await getBalance(message.address);
        sendResponse({ success: true, data: balance });
        break;

      case 'CONNECT_TO_SITE':
        await connectToSite(message.origin);
        sendResponse({ success: true });
        break;

      case 'DISCONNECT_FROM_SITE':
        await disconnectFromSite(message.origin);
        sendResponse({ success: true });
        break;

      case 'INJECT_WEB3_PROVIDER':
        await injectWeb3Provider(sender.tab?.id);
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('Background script error:', error);
    sendResponse({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Wallet state management
async function getWalletState() {
  const result = await chrome.storage.local.get([
    'isUnlocked',
    'address',
    'balance',
    'currentNetwork',
    'accounts'
  ]);
  
  return {
    isUnlocked: result.isUnlocked || false,
    address: result.address || null,
    balance: result.balance || '0',
    currentNetwork: result.currentNetwork || null,
    accounts: result.accounts || []
  };
}

async function unlockWallet(password: string) {
  try {
    // Mock wallet implementation for development
    // In production, this would use the actual SDK
    const mockAccounts = [
      {
        address: '0x' + Math.random().toString(16).substr(2, 40),
        name: 'Account 1',
        isImported: false
      }
    ];
    
    const currentAccount = mockAccounts[0];
    const balance = '1.5'; // Mock balance
    
    // Store wallet state
    await chrome.storage.local.set({
      isUnlocked: true,
      address: currentAccount?.address || null,
      balance,
      currentNetwork: { id: 'ethereum', name: 'Ethereum', chainId: 1 },
      accounts: mockAccounts
    });
    
    return { success: true, data: { accounts: mockAccounts, currentAccount, balance } };
  } catch (error) {
    return { success: false, data: { error: error instanceof Error ? error.message : 'Unlock failed' } };
  }
}

async function lockWallet() {
  await chrome.storage.local.set({
    isUnlocked: false,
    address: null,
    balance: '0'
  });
}

async function sendTransaction(transaction: any) {
  try {
    // Mock transaction for development
    const txHash = '0x' + Math.random().toString(16).substr(2, 64);
    
    // Store transaction in history
    const result = await chrome.storage.local.get(['recentTransactions']);
    const transactions = result.recentTransactions || [];
    transactions.unshift({
      hash: txHash,
      type: 'send',
      amount: transaction.value,
      to: transaction.to,
      from: transaction.from,
      timestamp: Date.now(),
      status: 'confirmed'
    });
    
    await chrome.storage.local.set({ 
      recentTransactions: transactions.slice(0, 50) // Keep only last 50
    });
    
    return { success: true, data: { txHash } };
  } catch (error) {
    return { success: false, data: { error: error instanceof Error ? error.message : 'Transaction failed' } };
  }
}

async function getBalance(address: string) {
  try {
    // Mock balance for development
    return '1.5';
  } catch (error) {
    throw new Error('Failed to get balance');
  }
}

async function connectToSite(origin: string) {
  const result = await chrome.storage.local.get(['connectedSites']);
  const connectedSites = result.connectedSites || [];
  
  if (!connectedSites.includes(origin)) {
    connectedSites.push(origin);
    await chrome.storage.local.set({ connectedSites });
  }
}

async function disconnectFromSite(origin: string) {
  const result = await chrome.storage.local.get(['connectedSites']);
  const connectedSites = result.connectedSites || [];
  const filtered = connectedSites.filter((site: string) => site !== origin);
  
  await chrome.storage.local.set({ connectedSites: filtered });
}

async function injectWeb3Provider(tabId?: number) {
  if (!tabId) return;
  
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['injected.js']
    });
  } catch (error) {
    console.error('Failed to inject Web3 provider:', error);
  }
}

// Handle tab updates to inject Web3 provider
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Only inject on web pages (not chrome:// or extension pages)
    if (tab.url.startsWith('http://') || tab.url.startsWith('https://')) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['injected.js']
        });
      } catch (error) {
        // Ignore errors for pages that can't be scripted
      }
    }
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('MPC Wallet extension started');
});

// Handle extension suspend/resume
chrome.runtime.onSuspend.addListener(() => {
  console.log('MPC Wallet extension suspended');
});
