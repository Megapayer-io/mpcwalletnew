export { EvmWallet } from './wallet.js';
export type {
  Network,
  Keystore,
  WalletState,
  Account,
  SendEthParams,
  SendErc20Params,
  TokenBalanceParams,
  AddNetworkParams,
  ImportAccountParams,
  CreateAccountParams,
  TransferNftParams
} from './types.js';
export { DEFAULT_NETWORKS } from './networks.js';
export { 
  encrypt, 
  decrypt, 
  securityAuditLogger, 
  sessionManager, 
  loginAttemptManager, 
  biometricManager,
  validatePasswordStrength,
  secureWipe,
} from './crypto.js';

