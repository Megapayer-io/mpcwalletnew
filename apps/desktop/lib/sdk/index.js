export { EvmWallet } from './wallet.js';
export { DEFAULT_NETWORKS } from './networks.js';
export { encrypt, decrypt, securityAuditLogger, sessionManager, loginAttemptManager, biometricManager, validatePasswordStrength, secureWipe, } from './crypto.js';
export { HardwareWalletType, hardwareWalletManager } from './hardware/HardwareWallet.js';
// Multi-sig functionality moved to v2.0
// export {
//   multiSigWalletManager,
//   type MultiSigConfig,
//   type MultiSigTransaction,
//   type MultiSigSignature,
//   type MultiSigProposal
// } from './multisig/MultiSigWallet.js';
