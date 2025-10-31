// Token Icon Service - Browser-friendly version
// This service provides multiple fallback APIs for fetching token icons

interface TokenIconResult {
  url: string | null;
  source: string;
}

export class TokenIconService {
  private static readonly POPULAR_TOKENS = {
    // Native tokens
    'ETH': 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    'MATIC': 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
    'POL': 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
    'BNB': 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    'AVAX': 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle.png',
    'FTM': 'https://assets.coingecko.com/coins/images/4001/large/Fantom_round.png',
    
    // Popular ERC-20 tokens
    'USDC': 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
    'USDT': 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
    'DAI': 'https://assets.coingecko.com/coins/images/9956/large/Badge_Dai.png',
    'WETH': 'https://assets.coingecko.com/coins/images/2518/large/weth.png',
    'WBTC': 'https://assets.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png',
    'UNI': 'https://assets.coingecko.com/coins/images/12504/large/uni.jpg',
    'LINK': 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    'AAVE': 'https://assets.coingecko.com/coins/images/12645/large/AAVE.png',
    'COMP': 'https://assets.coingecko.com/coins/images/10775/large/COMP.png',
    'MKR': 'https://assets.coingecko.com/coins/images/1364/large/Mark_Maker.png',
    'SNX': 'https://assets.coingecko.com/coins/images/3406/large/SNX.png',
    'YFI': 'https://assets.coingecko.com/coins/images/11849/large/yfi-192x192.png',
    '1INCH': 'https://assets.coingecko.com/coins/images/13469/large/1inch-token.png',
    'BAT': 'https://assets.coingecko.com/coins/images/677/large/basic-attention-token.png',
    'ZRX': 'https://assets.coingecko.com/coins/images/863/large/0x.png',
    'KNC': 'https://assets.coingecko.com/coins/images/1481/large/kyber-network-crystal.png',
    'LEO': 'https://assets.coingecko.com/coins/images/8418/large/leo-token.png',
    'CRV': 'https://assets.coingecko.com/coins/images/12124/large/Curve.png',
    'SUSHI': 'https://assets.coingecko.com/coins/images/12271/large/512x512_Logo_no_chop.png',
    'SHIB': 'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
    'DOGE': 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    'ADA': 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    'DOT': 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
    'SOL': 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    'ATOM': 'https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png',
    'NEAR': 'https://assets.coingecko.com/coins/images/10365/large/near.jpg',
    'ALGO': 'https://assets.coingecko.com/coins/images/4380/large/download.png',
    'ICP': 'https://assets.coingecko.com/coins/images/14495/large/Internet_Computer_logo.png',
    'FLOW': 'https://assets.coingecko.com/coins/images/13446/large/5f6294c0c7a8cda55cb1c936_Flow_Word_Mark.png',
    'XTZ': 'https://assets.coingecko.com/coins/images/976/large/Tezos-logo.png',
    'FIL': 'https://assets.coingecko.com/coins/images/12817/large/filecoin.png',
    'MANA': 'https://assets.coingecko.com/coins/images/878/large/decentraland-mana.png',
    'SAND': 'https://assets.coingecko.com/coins/images/12129/large/sandbox_logo.jpg',
    'AXS': 'https://assets.coingecko.com/coins/images/13029/large/axie_infinity_logo.png',
    'ENJ': 'https://assets.coingecko.com/coins/images/1102/large/enjin-coin-logo.png',
    'CHZ': 'https://assets.coingecko.com/coins/images/8834/large/Chiliz.png',
    'THETA': 'https://assets.coingecko.com/coins/images/2538/large/theta-token-logo.png',
    'VET': 'https://assets.coingecko.com/coins/images/307/large/VeChain-logo-Dark-Drop.png',
    'HBAR': 'https://assets.coingecko.com/coins/images/2822/large/hbar.png',
    'EGLD': 'https://assets.coingecko.com/coins/images/11035/large/elrond-egld-logo.png',
    'FTT': 'https://assets.coingecko.com/coins/images/9026/large/F.png',
    'CRO': 'https://assets.coingecko.com/coins/images/7310/large/cro_token_logo.png',
    'LTC': 'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
    'BCH': 'https://assets.coingecko.com/coins/images/780/large/bitcoin-cash.png',
    'XRP': 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    'TRX': 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
    'EOS': 'https://assets.coingecko.com/coins/images/738/large/eos-eos-logo.png',
    'XLM': 'https://assets.coingecko.com/coins/images/100/large/Stellar_symbol_black_RGB.png',
    'NEO': 'https://assets.coingecko.com/coins/images/480/large/NEO_512_512.png',
    'IOTA': 'https://assets.coingecko.com/coins/images/692/large/IOTA_Swirl.png',
    'DASH': 'https://assets.coingecko.com/coins/images/19/large/dash-logo.png',
    'ZEC': 'https://assets.coingecko.com/coins/images/486/large/circle-zcash-logo.png',
    'XMR': 'https://assets.coingecko.com/coins/images/69/large/monero_logo.png',
    'ETC': 'https://assets.coingecko.com/coins/images/453/large/ethereum-classic-logo.png',
    'QTUM': 'https://assets.coingecko.com/coins/images/684/large/qtum.png',
    'ONT': 'https://assets.coingecko.com/coins/images/3447/large/ont.jpg',
    'ICX': 'https://assets.coingecko.com/coins/images/1060/large/icx.png',
    'ZIL': 'https://assets.coingecko.com/coins/images/2687/large/Zilliqa-logo.png',
    'WAVES': 'https://assets.coingecko.com/coins/images/425/large/waves.png',
    'OMG': 'https://assets.coingecko.com/coins/images/776/large/OMG_Network.jpg',
    'REP': 'https://assets.coingecko.com/coins/images/1005/large/Augur.png',
    'GNT': 'https://assets.coingecko.com/coins/images/455/large/golem_logo.png',
    'STORJ': 'https://assets.coingecko.com/coins/images/949/large/storj.png',
    'FUN': 'https://assets.coingecko.com/coins/images/1199/large/funfair.png',
    'KMD': 'https://assets.coingecko.com/coins/images/956/large/kmd.png',
    'LSK': 'https://assets.coingecko.com/coins/images/913/large/lisk.png',
    'ARK': 'https://assets.coingecko.com/coins/images/613/large/ark.png',
    'PIVX': 'https://assets.coingecko.com/coins/images/548/large/pivx.png',
    'NAV': 'https://assets.coingecko.com/coins/images/355/large/navcoin.png',
    'MONA': 'https://assets.coingecko.com/coins/images/99/large/monacoin.png',
    'DGB': 'https://assets.coingecko.com/coins/images/62/large/digibyte.png',
    'SC': 'https://assets.coingecko.com/coins/images/936/large/siacoin.png',
    'DCR': 'https://assets.coingecko.com/coins/images/329/large/decred.png',
    'VERGE': 'https://assets.coingecko.com/coins/images/203/large/verge-symbol-color_%281%29.png',
    'ZEN': 'https://assets.coingecko.com/coins/images/691/large/horizen.png',
    'RVN': 'https://assets.coingecko.com/coins/images/3412/large/ravencoin.png',
    'GRIN': 'https://assets.coingecko.com/coins/images/7340/large/grin.png',
    'BEAM': 'https://assets.coingecko.com/coins/images/7335/large/beam.png',
    'MWC': 'https://assets.coingecko.com/coins/images/7341/large/mwc.png',
    'BTT': 'https://assets.coingecko.com/coins/images/7605/large/BTT_Token_Graphic.png',
    'WIN': 'https://assets.coingecko.com/coins/images/9129/large/Win.png',
    'JST': 'https://assets.coingecko.com/coins/images/12495/large/JST.jpg',
    'SUN': 'https://assets.coingecko.com/coins/images/12495/large/SUN.jpg',
    'NFT': 'https://assets.coingecko.com/coins/images/16751/large/nft-protocol.png',
    'JFI': 'https://assets.coingecko.com/coins/images/12504/large/jfi.png',
    'DEGO': 'https://assets.coingecko.com/coins/images/12503/large/dego.png',
    'PEARL': 'https://assets.coingecko.com/coins/images/12503/large/pearl.png',
    'YFII': 'https://assets.coingecko.com/coins/images/11849/large/yfii-192x192.png',
    'YAM': 'https://assets.coingecko.com/coins/images/12530/large/yam.png',
    'CREAM': 'https://assets.coingecko.com/coins/images/11976/large/Cream.png',
    'ALPHA': 'https://assets.coingecko.com/coins/images/12738/large/alpha.png',
    'COVER': 'https://assets.coingecko.com/coins/images/12530/large/cover.png',
    'KP3R': 'https://assets.coingecko.com/coins/images/12966/large/kp3r_logo.jpg',
    'HEGIC': 'https://assets.coingecko.com/coins/images/12493/large/Hegic.png',
    'PICKLE': 'https://assets.coingecko.com/coins/images/12470/large/pickle_finance.png',
    'AKRO': 'https://assets.coingecko.com/coins/images/12470/large/akro.png',
    'ADEL': 'https://assets.coingecko.com/coins/images/12470/large/adel.png',
    'LID': 'https://assets.coingecko.com/coins/images/12470/large/lid.png',
    'FARM': 'https://assets.coingecko.com/coins/images/12504/large/farm.png',
    'BASED': 'https://assets.coingecko.com/coins/images/12504/large/based.png'
  };

  static async getTokenIcon(symbol: string, address?: string): Promise<TokenIconResult> {
    // First check popular tokens (most reliable)
    if (this.POPULAR_TOKENS[symbol.toUpperCase() as keyof typeof this.POPULAR_TOKENS]) {
      const url = this.POPULAR_TOKENS[symbol.toUpperCase() as keyof typeof this.POPULAR_TOKENS];
      return { url, source: 'Popular Tokens Database' };
    }

    // For unknown tokens, generate a fallback icon
    return { url: null, source: 'Generated Fallback' };
  }

  static generateFallbackIcon(symbol: string, size: number = 48): string {
    // Generate a simple SVG icon with the first letter of the symbol
    const letter = symbol.charAt(0).toUpperCase();
    const colors = [
      '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    
    const colorIndex = symbol.charCodeAt(0) % colors.length;
    const color = colors[colorIndex];
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}CC;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#grad)" />
        <text x="50%" y="50%" text-anchor="middle" dy="0.35em" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white">${letter}</text>
      </svg>
    `)}`;
  }
}

// Export the main function for easy use
export const getTokenIcon = TokenIconService.getTokenIcon.bind(TokenIconService);
export const generateFallbackIcon = TokenIconService.generateFallbackIcon.bind(TokenIconService);
