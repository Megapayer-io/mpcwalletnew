// Token Logo Manager - Automatically fetches logos for all tokens in portfolio
import { TokenIconService } from './tokenIconService';

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance?: string;
  usdValue?: string;
  logoUrl?: string;
}

interface LogoUpdateResult {
  success: boolean;
  updatedCount: number;
  failedTokens: string[];
  message: string;
}

export class TokenLogoManager {
  private static readonly STORAGE_KEY = 'mpc-wallet-tokens';
  private static readonly LOGO_CACHE_KEY = 'mpc-wallet-token-logos';
  private static readonly LAST_UPDATE_KEY = 'mpc-wallet-logos-last-update';
  
  // Cache duration: 24 hours
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000;

  /**
   * Automatically fetch logos for all tokens in the portfolio
   */
  static async updateAllTokenLogos(): Promise<LogoUpdateResult> {
    try {
      console.log('🔄 Starting automatic logo update for all tokens...');
      
      // Get all tokens from localStorage
      const tokens = this.getStoredTokens();
      if (tokens.length === 0) {
        return {
          success: true,
          updatedCount: 0,
          failedTokens: [],
          message: 'No tokens found in portfolio'
        };
      }

      console.log(`📊 Found ${tokens.length} tokens to update`);

      let updatedCount = 0;
      const failedTokens: string[] = [];
      const updatedTokens: Token[] = [];

      // Process all tokens synchronously to avoid API issues
      for (const token of tokens) {
        try {
          // Skip if token already has a logo
          if (token.logoUrl) {
            console.log(`✅ ${token.symbol} already has logo, skipping`);
            updatedTokens.push(token);
            continue;
          }

          console.log(`🔍 Fetching logo for ${token.symbol} (${token.name})`);
          
          // Try to get logo from our service
          const iconResult = await TokenIconService.getTokenIcon(token.symbol, token.address);
          
          if (iconResult.url) {
            console.log(`✅ Found logo for ${token.symbol} from ${iconResult.source}`);
            updatedTokens.push({
              ...token,
              logoUrl: iconResult.url
            });
            updatedCount++;
          } else {
            console.log(`❌ No logo found for ${token.symbol}, using fallback`);
            updatedTokens.push(token);
            failedTokens.push(token.symbol);
          }
        } catch (error) {
          console.error(`❌ Error fetching logo for ${token.symbol}:`, error);
          updatedTokens.push(token);
          failedTokens.push(token.symbol);
        }
      }

      // Save updated tokens back to localStorage
      this.saveTokens(updatedTokens);
      
      // Update cache timestamp
      this.setLastUpdateTime(Date.now());

      console.log(`🎉 Logo update complete! Updated ${updatedCount} tokens`);
      
      return {
        success: true,
        updatedCount,
        failedTokens,
        message: `Successfully updated ${updatedCount} token logos. ${failedTokens.length} tokens using fallback icons.`
      };

    } catch (error) {
      console.error('❌ Error during bulk logo update:', error);
      return {
        success: false,
        updatedCount: 0,
        failedTokens: [],
        message: `Failed to update logos: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Update logos for tokens that don't have them yet
   */
  static async updateMissingLogos(): Promise<LogoUpdateResult> {
    try {
      console.log('🔍 Updating logos for tokens that are missing them...');
      
      const tokens = this.getStoredTokens();
      const tokensWithoutLogos = tokens.filter(token => !token.logoUrl);
      
      if (tokensWithoutLogos.length === 0) {
        return {
          success: true,
          updatedCount: 0,
          failedTokens: [],
          message: 'All tokens already have logos!'
        };
      }

      console.log(`📊 Found ${tokensWithoutLogos.length} tokens without logos`);

      let updatedCount = 0;
      const failedTokens: string[] = [];
      const updatedTokens: Token[] = [...tokens];

      // Process tokens without logos
      for (const token of tokensWithoutLogos) {
        try {
          console.log(`🔍 Fetching logo for ${token.symbol} (${token.name})`);
          
          const iconResult = await TokenIconService.getTokenIcon(token.symbol, token.address);
          
          if (iconResult.url) {
            console.log(`✅ Found logo for ${token.symbol} from ${iconResult.source}`);
            
            // Update the token in our array
            const tokenIndex = updatedTokens.findIndex(t => t.address === token.address);
            if (tokenIndex !== -1) {
              updatedTokens[tokenIndex] = {
                ...updatedTokens[tokenIndex],
                logoUrl: iconResult.url
              };
              updatedCount++;
            }
          } else {
            console.log(`❌ No logo found for ${token.symbol}`);
            failedTokens.push(token.symbol);
          }
        } catch (error) {
          console.error(`❌ Error fetching logo for ${token.symbol}:`, error);
          failedTokens.push(token.symbol);
        }

        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Save updated tokens
      this.saveTokens(updatedTokens);

      console.log(`🎉 Missing logo update complete! Updated ${updatedCount} tokens`);
      
      return {
        success: true,
        updatedCount,
        failedTokens,
        message: `Successfully updated ${updatedCount} missing token logos. ${failedTokens.length} tokens still need logos.`
      };

    } catch (error) {
      console.error('❌ Error during missing logo update:', error);
      return {
        success: false,
        updatedCount: 0,
        failedTokens: [],
        message: `Failed to update missing logos: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Force refresh all logos (ignores cache)
   */
  static async refreshAllLogos(): Promise<LogoUpdateResult> {
    console.log('🔄 Force refreshing all token logos...');
    
    // Clear cache timestamp to force update
    this.clearLastUpdateTime();
    
    // Update all logos
    return this.updateAllTokenLogos();
  }

  /**
   * Clear all cached logos and force refresh
   */
  static async clearCacheAndRefresh(): Promise<LogoUpdateResult> {
    console.log('🔄 Clearing logo cache and refreshing all tokens...');
    
    // Get all tokens and remove duplicates
    let tokens = this.getStoredTokens();
    
    // Remove duplicate native tokens (address === '')
    const nativeTokens = tokens.filter(token => token.address === '');
    const customTokens = tokens.filter(token => token.address !== '');
    
    // If there are multiple native tokens, keep only the first one
    if (nativeTokens.length > 1) {
      tokens = [nativeTokens[0], ...customTokens];
    }
    
    // Remove logoUrl from all tokens
    const tokensWithoutLogos = tokens.map(token => ({
      ...token,
      logoUrl: undefined
    }));
    
    // Save tokens without logos
    this.saveTokens(tokensWithoutLogos);
    
    // Clear cache timestamp
    this.clearLastUpdateTime();
    
    // Update all logos
    return this.updateAllTokenLogos();
  }

  /**
   * Get tokens that need logo updates
   */
  static getTokensNeedingLogos(): Token[] {
    const tokens = this.getStoredTokens();
    return tokens.filter(token => !token.logoUrl || !this.isLogoRecent(token.logoUrl));
  }

  /**
   * Get logo update statistics
   */
  static getLogoStats(): {
    totalTokens: number;
    tokensWithLogos: number;
    tokensWithoutLogos: number;
    lastUpdate: Date | null;
    needsUpdate: boolean;
  } {
    const tokens = this.getStoredTokens();
    const tokensWithLogos = tokens.filter(token => token.logoUrl).length;
    const tokensWithoutLogos = tokens.length - tokensWithLogos;
    const lastUpdate = this.getLastUpdateTime();
    const needsUpdate = !lastUpdate || (Date.now() - lastUpdate) > this.CACHE_DURATION;

    return {
      totalTokens: tokens.length,
      tokensWithLogos,
      tokensWithoutLogos,
      lastUpdate: lastUpdate ? new Date(lastUpdate) : null,
      needsUpdate
    };
  }

  // Private helper methods

  private static getStoredTokens(): Token[] {
    try {
      // Get current network from wallet store
      const walletState = localStorage.getItem('mpc-wallet-state');
      if (!walletState) return [];
      
      const state = JSON.parse(walletState);
      const currentNetwork = state?.currentNetwork;
      
      if (!currentNetwork?.chainId) return [];
      
      // Load tokens specific to current network
      const networkKey = `mpc-wallet-tokens-${currentNetwork.chainId}`;
      const stored = localStorage.getItem(networkKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading tokens from localStorage:', error);
      return [];
    }
  }

  private static saveTokens(tokens: Token[]): void {
    try {
      // Get current network from wallet store
      const walletState = localStorage.getItem('mpc-wallet-state');
      if (!walletState) return;
      
      const state = JSON.parse(walletState);
      const currentNetwork = state?.currentNetwork;
      
      if (!currentNetwork?.chainId) return;
      
      // Save tokens specific to current network
      const networkKey = `mpc-wallet-tokens-${currentNetwork.chainId}`;
      localStorage.setItem(networkKey, JSON.stringify(tokens));
      console.log(`💾 Saved ${tokens.length} tokens to localStorage for network ${currentNetwork.chainId}`);
    } catch (error) {
      console.error('Error saving tokens to localStorage:', error);
    }
  }

  private static getLastUpdateTime(): number | null {
    try {
      const stored = localStorage.getItem(this.LAST_UPDATE_KEY);
      return stored ? parseInt(stored, 10) : null;
    } catch (error) {
      console.error('Error getting last update time:', error);
      return null;
    }
  }

  private static setLastUpdateTime(timestamp: number): void {
    try {
      localStorage.setItem(this.LAST_UPDATE_KEY, timestamp.toString());
    } catch (error) {
      console.error('Error setting last update time:', error);
    }
  }

  private static clearLastUpdateTime(): void {
    try {
      localStorage.removeItem(this.LAST_UPDATE_KEY);
    } catch (error) {
      console.error('Error clearing last update time:', error);
    }
  }

  private static isLogoRecent(logoUrl: string): boolean {
    // Check if logo URL contains timestamp or is from a reliable source
    // For now, we'll consider all logos as "recent" if they exist
    // In a more sophisticated implementation, we could check file modification dates
    return !!logoUrl;
  }
}

// Export convenience functions
export const updateAllTokenLogos = TokenLogoManager.updateAllTokenLogos.bind(TokenLogoManager);
export const updateMissingLogos = TokenLogoManager.updateMissingLogos.bind(TokenLogoManager);
export const refreshAllLogos = TokenLogoManager.refreshAllLogos.bind(TokenLogoManager);
export const clearCacheAndRefresh = TokenLogoManager.clearCacheAndRefresh.bind(TokenLogoManager);
export const getTokensNeedingLogos = TokenLogoManager.getTokensNeedingLogos.bind(TokenLogoManager);
export const getLogoStats = TokenLogoManager.getLogoStats.bind(TokenLogoManager);
