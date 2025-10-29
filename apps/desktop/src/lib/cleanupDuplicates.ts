/**
 * Utility to clean up duplicate tokens in localStorage
 */

export function cleanupDuplicateTokens(): void {
  console.log('🧹 Cleaning up duplicate tokens...');
  
  const storedTokens = localStorage.getItem('mpc-wallet-tokens');
  if (!storedTokens) {
    console.log('No tokens found in localStorage');
    return;
  }
  
  let tokens = JSON.parse(storedTokens);
  console.log(`Found ${tokens.length} tokens before cleanup:`, tokens);
  
  // Remove ALL native tokens first (address === '')
  const customTokens = tokens.filter((token: any) => token.address !== '');
  console.log(`Found ${customTokens.length} custom tokens (non-native)`);
  
  // Create a new clean token list with only custom tokens
  tokens = customTokens;
  
  console.log(`Cleaned up to ${tokens.length} tokens (removed all native tokens)`);
  
  // Save cleaned tokens (only custom tokens, no native tokens)
  localStorage.setItem('mpc-wallet-tokens', JSON.stringify(tokens));
  
  console.log('✅ Token cleanup complete - removed all native tokens');
}

/**
 * Force remove all MATIC/Polygon tokens and start fresh
 */
export function forceRemoveAllMaticTokens(): void {
  console.log('🔥 Force removing ALL MATIC tokens...');
  
  const storedTokens = localStorage.getItem('mpc-wallet-tokens');
  if (!storedTokens) {
    console.log('No tokens found in localStorage');
    return;
  }
  
  let tokens = JSON.parse(storedTokens);
  console.log(`Found ${tokens.length} tokens before MATIC removal:`, tokens);
  
  // Remove ALL tokens with MATIC symbol or Polygon name
  tokens = tokens.filter((token: any) => 
    token.symbol?.toUpperCase() !== 'MATIC' && 
    token.symbol?.toUpperCase() !== 'POL' &&
    token.name?.toLowerCase() !== 'polygon' &&
    token.address !== '' // Also remove any native tokens
  );
  
  console.log(`Removed all MATIC tokens, ${tokens.length} tokens remaining:`, tokens);
  
  // Save cleaned tokens
  localStorage.setItem('mpc-wallet-tokens', JSON.stringify(tokens));
  
  console.log('✅ All MATIC tokens removed');
}

// Auto-run cleanup when this module is imported
if (typeof window !== 'undefined') {
  forceRemoveAllMaticTokens(); // Use the more aggressive cleanup
}
