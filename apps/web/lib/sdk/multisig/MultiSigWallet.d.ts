/**
 * Multi-Signature Wallet Implementation
 * Supports M-of-N signature schemes for enhanced security
 */
export interface MultiSigConfig {
    threshold: number;
    signers: string[];
    nonce: number;
    chainId: number;
}
export interface MultiSigTransaction {
    to: string;
    value: string;
    data: string;
    gasLimit: string;
    gasPrice: string;
    nonce: number;
    signatures: MultiSigSignature[];
    executed: boolean;
    transactionHash?: string;
}
export interface MultiSigSignature {
    signer: string;
    signature: string;
    timestamp: number;
}
export interface MultiSigProposal {
    id: string;
    transaction: MultiSigTransaction;
    proposer: string;
    timestamp: number;
    status: 'pending' | 'approved' | 'rejected' | 'executed';
    approvals: MultiSigSignature[];
    rejections: MultiSigSignature[];
}
/**
 * Multi-Signature Wallet Manager
 */
export declare class MultiSigWalletManager {
    private config;
    private proposals;
    private transactions;
    constructor();
    /**
     * Create a new multi-signature wallet
     */
    createMultiSigWallet(threshold: number, signers: string[], chainId: number): Promise<MultiSigConfig>;
    /**
     * Load existing multi-signature wallet
     */
    loadMultiSigWallet(config: MultiSigConfig): Promise<void>;
    /**
     * Get current multi-signature configuration
     */
    getConfig(): MultiSigConfig | null;
    /**
     * Check if multi-signature wallet is configured
     */
    isConfigured(): boolean;
    /**
     * Create a new transaction proposal
     */
    createProposal(to: string, value: string, data: string | undefined, gasLimit: string | undefined, gasPrice: string | undefined, proposer: string): Promise<MultiSigProposal>;
    /**
     * Approve a transaction proposal
     */
    approveProposal(proposalId: string, signer: string, signature: string): Promise<MultiSigProposal>;
    /**
     * Reject a transaction proposal
     */
    rejectProposal(proposalId: string, signer: string, reason?: string): Promise<MultiSigProposal>;
    /**
     * Execute an approved transaction
     */
    executeTransaction(proposalId: string): Promise<string>;
    /**
     * Get all proposals
     */
    getProposals(): MultiSigProposal[];
    /**
     * Get proposal by ID
     */
    getProposal(proposalId: string): MultiSigProposal | undefined;
    /**
     * Get pending proposals
     */
    getPendingProposals(): MultiSigProposal[];
    /**
     * Get approved proposals
     */
    getApprovedProposals(): MultiSigProposal[];
    /**
     * Check if user is a signer
     */
    isSigner(address: string): boolean;
    /**
     * Get signers
     */
    getSigners(): string[];
    /**
     * Get threshold
     */
    getThreshold(): number;
    /**
     * Validate Ethereum address
     */
    private isValidAddress;
    /**
     * Generate unique proposal ID
     */
    private generateProposalId;
    /**
     * Combine multiple signatures
     */
    private combineSignatures;
    /**
     * Execute multi-signature transaction
     */
    private executeMultiSigTransaction;
    /**
     * Save to localStorage
     */
    private saveToStorage;
    /**
     * Load from localStorage
     */
    private loadFromStorage;
    /**
     * Clear all data
     */
    clearAllData(): void;
    /**
     * Get proposal statistics
     */
    getProposalStats(): {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        executed: number;
    };
}
export declare const multiSigWalletManager: MultiSigWalletManager;
