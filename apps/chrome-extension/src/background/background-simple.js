// Background script for MPC Wallet Chrome Extension

// Extension lifecycle
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('MPC Wallet extension installed');
    
    // Set default settings
    await chrome.storage.local.set({
      isFirstInstall: true,
      connectedSites: [],
      recentTransactions: []
    });
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  switch (message.type) {
    case 'GET_WALLET_STATE':
      handleGetWalletState(sendResponse);
      return true; // Keep message channel open for async response
      
    case 'UNLOCK_WALLET':
      handleUnlockWallet(message.password, sendResponse);
      return true;
      
    case 'LOCK_WALLET':
      handleLockWallet(sendResponse);
      return true;
      
    case 'SEND_TRANSACTION':
      handleSendTransaction(message.transaction, sendResponse);
      return true;
      
    case 'GET_BALANCE':
      handleGetBalance(message.address, sendResponse);
      return true;
      
    case 'CONTENT_SCRIPT_READY':
      console.log('Content script ready');
      sendResponse({ success: true });
      break;
      
    default:
      console.log('Unknown message type:', message.type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

// Mock wallet state handler
async function handleGetWalletState(sendResponse) {
  try {
    const result = await chrome.storage.local.get(['isUnlocked', 'address', 'balance', 'currentNetwork', 'accounts']);
    
    sendResponse({
      success: true,
      data: {
        isUnlocked: result.isUnlocked || false,
        address: result.address || null,
        balance: result.balance || '0',
        currentNetwork: result.currentNetwork || { id: 'ethereum', name: 'Ethereum', chainId: 1 },
        accounts: result.accounts || []
      }
    });
  } catch (error) {
    sendResponse({
      success: false,
      data: { error: error.message }
    });
  }
}

// Mock unlock wallet handler
async function handleUnlockWallet(password, sendResponse) {
  try {
    // Mock unlock - in production, this would validate the password
    if (password && password.length > 0) {
      await chrome.storage.local.set({
        isUnlocked: true,
        address: '0x' + Math.random().toString(16).substr(2, 40),
        balance: '1.5',
        currentNetwork: { id: 'ethereum', name: 'Ethereum', chainId: 1 }
      });
      
      sendResponse({ success: true, data: { message: 'Wallet unlocked' } });
    } else {
      sendResponse({ success: false, data: { error: 'Invalid password' } });
    }
  } catch (error) {
    sendResponse({ success: false, data: { error: error.message } });
  }
}

// Mock lock wallet handler
async function handleLockWallet(sendResponse) {
  try {
    await chrome.storage.local.set({ isUnlocked: false });
    sendResponse({ success: true, data: { message: 'Wallet locked' } });
  } catch (error) {
    sendResponse({ success: false, data: { error: error.message } });
  }
}

// Mock send transaction handler
async function handleSendTransaction(transaction, sendResponse) {
  try {
    // Mock transaction - in production, this would sign and broadcast
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
    
    sendResponse({ success: true, data: { txHash } });
  } catch (error) {
    sendResponse({ success: false, data: { error: error.message } });
  }
}

// Mock get balance handler
async function handleGetBalance(address, sendResponse) {
  try {
    // Mock balance - in production, this would query the blockchain
    const balance = '1.5';
    sendResponse({ success: true, data: balance });
  } catch (error) {
    sendResponse({ success: false, data: { error: error.message } });
  }
}

console.log('MPC Wallet background script loaded');
