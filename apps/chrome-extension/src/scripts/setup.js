document.addEventListener('DOMContentLoaded', function() {
    const setupOptions = document.getElementById('setup-options');
    const createForm = document.getElementById('create-wallet-form');
    const importForm = document.getElementById('import-wallet-form');
    const backBtn = document.getElementById('back-btn');
    
    // Setup option handlers
    document.getElementById('create-wallet-option').addEventListener('click', function() {
        setupOptions.style.display = 'none';
        createForm.style.display = 'block';
        backBtn.style.display = 'block';
    });
    
    document.getElementById('import-wallet-option').addEventListener('click', function() {
        setupOptions.style.display = 'none';
        importForm.style.display = 'block';
        backBtn.style.display = 'block';
    });
    
    document.getElementById('connect-hardware-option').addEventListener('click', function() {
        alert('Hardware wallet connection coming soon!');
    });
    
    // Back button
    backBtn.addEventListener('click', function() {
        setupOptions.style.display = 'block';
        createForm.style.display = 'none';
        importForm.style.display = 'none';
        backBtn.style.display = 'none';
    });
    
    // Cancel buttons
    document.getElementById('cancel-create').addEventListener('click', function() {
        setupOptions.style.display = 'block';
        createForm.style.display = 'none';
        backBtn.style.display = 'none';
    });
    
    document.getElementById('cancel-import').addEventListener('click', function() {
        setupOptions.style.display = 'block';
        importForm.style.display = 'none';
        backBtn.style.display = 'none';
    });
    
    // Create wallet
    document.getElementById('create-wallet-btn').addEventListener('click', async function() {
        const password = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const accountName = document.getElementById('account-name').value;
        
        if (!password) {
            alert('Please enter a password');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        if (password.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }
        
        const btn = this;
        btn.disabled = true;
        btn.textContent = 'Creating...';
        
        try {
            const result = await window.walletService.createWallet(password);
            
            if (result.success) {
                alert('Wallet created successfully!');
                // Redirect to main popup
                window.location.href = 'popup-simple.html';
            } else {
                alert('Failed to create wallet: ' + result.error);
            }
        } catch (error) {
            alert('Failed to create wallet: ' + error.message);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Create Wallet';
        }
    });
    
    // Import wallet
    document.getElementById('import-wallet-btn').addEventListener('click', async function() {
        const importData = document.getElementById('import-data').value;
        const accountName = document.getElementById('import-account-name').value;
        const password = document.getElementById('import-password').value;
        const method = document.getElementById('import-method').value;
        
        if (!importData || !password) {
            alert('Please fill in all required fields');
            return;
        }
        
        const btn = this;
        btn.disabled = true;
        btn.textContent = 'Importing...';
        
        try {
            let result;
            if (method === 'private-key') {
                result = await window.walletService.importAccount(importData, accountName);
            } else {
                // Handle seed phrase import
                alert('Seed phrase import coming soon!');
                return;
            }
            
            if (result.success) {
                alert('Wallet imported successfully!');
                // Redirect to main popup
                window.location.href = 'popup-simple.html';
            } else {
                alert('Failed to import wallet: ' + result.error);
            }
        } catch (error) {
            alert('Failed to import wallet: ' + error.message);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Import Wallet';
        }
    });
});

