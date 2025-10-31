/**
 * Multi-Signature Wallet Implementation
 * Supports M-of-N signature schemes for enhanced security
 */
/**
 * Multi-Signature Wallet Manager
 */
export class MultiSigWalletManager {
    config = null;
    proposals = new Map();
    transactions = new Map();
    constructor() {
        this.loadFromStorage();
    }
    /**
     * Create a new multi-signature wallet
     */
    async createMultiSigWallet(threshold, signers, chainId) {
        if (threshold > signers.length) {
            throw new Error('Threshold cannot be greater than number of signers');
        }
        if (threshold < 1) {
            throw new Error('Threshold must be at least 1');
        }
        if (signers.length < 2) {
            throw new Error('Multi-signature wallet requires at least 2 signers');
        }
        // Validate all signer addresses
        for (const signer of signers) {
            if (!this.isValidAddress(signer)) {
                throw new Error(`Invalid signer address: ${signer}`);
            }
        }
        // Check for duplicate signers
        const uniqueSigners = [...new Set(signers)];
        if (uniqueSigners.length !== signers.length) {
            throw new Error('Duplicate signers are not allowed');
        }
        this.config = {
            threshold,
            signers: uniqueSigners,
            nonce: 0,
            chainId
        };
        await this.saveToStorage();
        return this.config;
    }
    /**
     * Load existing multi-signature wallet
     */
    async loadMultiSigWallet(config) {
        this.config = config;
        await this.loadFromStorage();
    }
    /**
     * Get current multi-signature configuration
     */
    getConfig() {
        return this.config;
    }
    /**
     * Check if multi-signature wallet is configured
     */
    isConfigured() {
        return this.config !== null;
    }
    /**
     * Create a new transaction proposal
     */
    async createProposal(to, value, data = '0x', gasLimit = '21000', gasPrice = '20000000000', proposer) {
        if (!this.config) {
            throw new Error('Multi-signature wallet not configured');
        }
        if (!this.config.signers.includes(proposer)) {
            throw new Error('Proposer must be a signer');
        }
        if (!this.isValidAddress(to)) {
            throw new Error('Invalid recipient address');
        }
        const transaction = {
            to,
            value,
            data,
            gasLimit,
            gasPrice,
            nonce: this.config.nonce,
            signatures: [],
            executed: false
        };
        const proposal = {
            id: this.generateProposalId(),
            transaction,
            proposer,
            timestamp: Date.now(),
            status: 'pending',
            approvals: [],
            rejections: []
        };
        this.proposals.set(proposal.id, proposal);
        this.transactions.set(proposal.id, transaction);
        await this.saveToStorage();
        return proposal;
    }
    /**
     * Approve a transaction proposal
     */
    async approveProposal(proposalId, signer, signature) {
        if (!this.config) {
            throw new Error('Multi-signature wallet not configured');
        }
        const proposal = this.proposals.get(proposalId);
        if (!proposal) {
            throw new Error('Proposal not found');
        }
        if (proposal.status !== 'pending') {
            throw new Error('Proposal is no longer pending');
        }
        if (!this.config.signers.includes(signer)) {
            throw new Error('Signer not authorized');
        }
        // Check if already approved by this signer
        const existingApproval = proposal.approvals.find(approval => approval.signer === signer);
        if (existingApproval) {
            throw new Error('Proposal already approved by this signer');
        }
        // Check if already rejected by this signer
        const existingRejection = proposal.rejections.find(rejection => rejection.signer === signer);
        if (existingRejection) {
            throw new Error('Proposal already rejected by this signer');
        }
        const approval = {
            signer,
            signature,
            timestamp: Date.now()
        };
        proposal.approvals.push(approval);
        proposal.transaction.signatures.push(approval);
        // Check if threshold is reached
        if (proposal.approvals.length >= this.config.threshold) {
            proposal.status = 'approved';
        }
        this.proposals.set(proposalId, proposal);
        await this.saveToStorage();
        return proposal;
    }
    /**
     * Reject a transaction proposal
     */
    async rejectProposal(proposalId, signer, reason) {
        if (!this.config) {
            throw new Error('Multi-signature wallet not configured');
        }
        const proposal = this.proposals.get(proposalId);
        if (!proposal) {
            throw new Error('Proposal not found');
        }
        if (proposal.status !== 'pending') {
            throw new Error('Proposal is no longer pending');
        }
        if (!this.config.signers.includes(signer)) {
            throw new Error('Signer not authorized');
        }
        // Check if already approved by this signer
        const existingApproval = proposal.approvals.find(approval => approval.signer === signer);
        if (existingApproval) {
            throw new Error('Proposal already approved by this signer');
        }
        // Check if already rejected by this signer
        const existingRejection = proposal.rejections.find(rejection => rejection.signer === signer);
        if (existingRejection) {
            throw new Error('Proposal already rejected by this signer');
        }
        const rejection = {
            signer,
            signature: reason || 'Rejected',
            timestamp: Date.now()
        };
        proposal.rejections.push(rejection);
        // Check if enough rejections to reject the proposal
        const remainingSigners = this.config.signers.length - proposal.approvals.length - proposal.rejections.length;
        if (remainingSigners + proposal.approvals.length < this.config.threshold) {
            proposal.status = 'rejected';
        }
        this.proposals.set(proposalId, proposal);
        await this.saveToStorage();
        return proposal;
    }
    /**
     * Execute an approved transaction
     */
    async executeTransaction(proposalId) {
        if (!this.config) {
            throw new Error('Multi-signature wallet not configured');
        }
        const proposal = this.proposals.get(proposalId);
        if (!proposal) {
            throw new Error('Proposal not found');
        }
        if (proposal.status !== 'approved') {
            throw new Error('Transaction not approved');
        }
        if (proposal.approvals.length < this.config.threshold) {
            throw new Error('Insufficient approvals');
        }
        try {
            // Combine signatures
            const combinedSignature = this.combineSignatures(proposal.transaction.signatures);
            // Execute transaction (this would integrate with your wallet's transaction system)
            const transactionHash = await this.executeMultiSigTransaction(proposal.transaction, combinedSignature);
            proposal.status = 'executed';
            proposal.transaction.executed = true;
            proposal.transaction.transactionHash = transactionHash;
            // Increment nonce
            this.config.nonce++;
            this.proposals.set(proposalId, proposal);
            await this.saveToStorage();
            return transactionHash;
        }
        catch (error) {
            throw new Error(`Failed to execute transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get all proposals
     */
    getProposals() {
        return Array.from(this.proposals.values()).sort((a, b) => b.timestamp - a.timestamp);
    }
    /**
     * Get proposal by ID
     */
    getProposal(proposalId) {
        return this.proposals.get(proposalId);
    }
    /**
     * Get pending proposals
     */
    getPendingProposals() {
        return this.getProposals().filter(proposal => proposal.status === 'pending');
    }
    /**
     * Get approved proposals
     */
    getApprovedProposals() {
        return this.getProposals().filter(proposal => proposal.status === 'approved');
    }
    /**
     * Check if user is a signer
     */
    isSigner(address) {
        return this.config?.signers.includes(address) || false;
    }
    /**
     * Get signers
     */
    getSigners() {
        return this.config?.signers || [];
    }
    /**
     * Get threshold
     */
    getThreshold() {
        return this.config?.threshold || 0;
    }
    /**
     * Validate Ethereum address
     */
    isValidAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
    /**
     * Generate unique proposal ID
     */
    generateProposalId() {
        return `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Combine multiple signatures
     */
    combineSignatures(signatures) {
        // This is a simplified implementation
        // In a real implementation, you would use proper signature aggregation
        return signatures.map(sig => sig.signature).join('');
    }
    /**
     * Execute multi-signature transaction
     */
    async executeMultiSigTransaction(transaction, signature) {
        // This would integrate with your wallet's transaction execution system
        // For now, we'll simulate a transaction hash
        return `0x${Math.random().toString(16).substr(2, 64)}`;
    }
    /**
     * Save to localStorage
     */
    async saveToStorage() {
        if (typeof localStorage !== 'undefined') {
            const data = {
                config: this.config,
                proposals: Array.from(this.proposals.entries()),
                transactions: Array.from(this.transactions.entries())
            };
            localStorage.setItem('mpc-wallet-multisig', JSON.stringify(data));
        }
    }
    /**
     * Load from localStorage
     */
    async loadFromStorage() {
        if (typeof localStorage !== 'undefined') {
            const data = localStorage.getItem('mpc-wallet-multisig');
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    this.config = parsed.config;
                    this.proposals = new Map(parsed.proposals || []);
                    this.transactions = new Map(parsed.transactions || []);
                }
                catch (error) {
                    console.error('Failed to load multi-signature data:', error);
                }
            }
        }
    }
    /**
     * Clear all data
     */
    clearAllData() {
        this.config = null;
        this.proposals.clear();
        this.transactions.clear();
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('mpc-wallet-multisig');
        }
    }
    /**
     * Get proposal statistics
     */
    getProposalStats() {
        const proposals = this.getProposals();
        return {
            total: proposals.length,
            pending: proposals.filter(p => p.status === 'pending').length,
            approved: proposals.filter(p => p.status === 'approved').length,
            rejected: proposals.filter(p => p.status === 'rejected').length,
            executed: proposals.filter(p => p.status === 'executed').length
        };
    }
}
// Export singleton instance
export const multiSigWalletManager = new MultiSigWalletManager();
