// StakeVue - Casper Liquid Staking Dashboard
// Casper Hackathon 2026

// State
let isConnected = false;
let userPublicKey = null;
let casperClient = null;

// Constants
const TESTNET_RPC = 'https://rpc.testnet.casperlabs.io/rpc';
const MIN_STAKE = 100;

// DOM Elements
const connectWalletBtn = document.getElementById('connect-wallet');
const walletStatus = document.getElementById('wallet-status');
const walletAddress = document.getElementById('wallet-address');
const walletBalance = document.getElementById('wallet-balance');
const stakeAmountInput = document.getElementById('stake-amount');
const stakeButton = document.getElementById('stake-button');
const totalStakedEl = document.getElementById('total-staked');
const userStakeEl = document.getElementById('user-stake');
const estRewardsEl = document.getElementById('est-rewards');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkWalletConnection();
    loadStakingStats();
});

// Event Listeners
function setupEventListeners() {
    connectWalletBtn.addEventListener('click', connectWallet);
    stakeButton.addEventListener('click', handleStake);
    stakeAmountInput.addEventListener('input', calculateRewards);
}

// Wallet Connection
async function connectWallet() {
    try {
        showToast('Connecting to Casper wallet...', 'info');

        // Check if CasperWallet or Casper Signer is available
        if (window.casperlabsHelper) {
            // Try to connect with Casper Signer
            const connected = await window.casperlabsHelper.requestConnection();

            if (connected) {
                userPublicKey = await window.casperlabsHelper.getActivePublicKey();
                isConnected = true;

                updateWalletUI();
                loadUserData();
                showToast('Wallet connected successfully!', 'success');
            }
        } else {
            // Fallback for development/testing
            showToast('Please install Casper Signer or CSPR.click wallet extension', 'error');

            // For demo purposes, simulate connection
            simulateWalletConnection();
        }
    } catch (error) {
        console.error('Wallet connection error:', error);
        showToast('Failed to connect wallet. Please try again.', 'error');
    }
}

// Simulate wallet connection for development
function simulateWalletConnection() {
    userPublicKey = '0203a1e6...demo...address';
    isConnected = true;
    updateWalletUI();
    loadUserData();
    showToast('Demo mode: Wallet simulated', 'success');
}

// Check if wallet is already connected
async function checkWalletConnection() {
    try {
        if (window.casperlabsHelper) {
            const connected = await window.casperlabsHelper.isConnected();
            if (connected) {
                userPublicKey = await window.casperlabsHelper.getActivePublicKey();
                isConnected = true;
                updateWalletUI();
                loadUserData();
            }
        }
    } catch (error) {
        console.log('No wallet connected');
    }
}

// Update UI after wallet connection
function updateWalletUI() {
    if (isConnected) {
        connectWalletBtn.textContent = 'Connected';
        connectWalletBtn.disabled = true;
        connectWalletBtn.style.background = 'var(--success)';

        walletStatus.classList.remove('hidden');

        // Format address for display
        const shortAddress = userPublicKey.substring(0, 8) + '...' + userPublicKey.substring(userPublicKey.length - 6);
        walletAddress.textContent = shortAddress;
    }
}

// Load user-specific data
async function loadUserData() {
    try {
        // Simulate loading balance (in real app, query the blockchain)
        const balance = Math.random() * 10000 + 1000;
        walletBalance.textContent = `${balance.toFixed(2)} CSPR`;

        // Load user's stake
        const userStake = Math.random() * 5000;
        userStakeEl.textContent = `${userStake.toFixed(2)} CSPR`;

    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Load overall staking statistics
async function loadStakingStats() {
    try {
        // Simulate total staked (in real app, query the smart contract)
        const totalStaked = Math.random() * 1000000 + 500000;
        totalStakedEl.textContent = `${formatNumber(totalStaked)} CSPR`;

        // Update stats periodically
        setInterval(loadStakingStats, 30000); // Update every 30 seconds
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Handle stake transaction
async function handleStake() {
    const amount = parseFloat(stakeAmountInput.value);

    // Validation
    if (!isConnected) {
        showToast('Please connect your wallet first', 'error');
        return;
    }

    if (!amount || amount < MIN_STAKE) {
        showToast(`Minimum stake amount is ${MIN_STAKE} CSPR`, 'error');
        return;
    }

    try {
        showToast('Preparing transaction...', 'info');
        stakeButton.textContent = 'Processing...';
        stakeButton.disabled = true;

        // Here you would create and send the actual transaction
        // For now, simulate the transaction
        await simulateStakeTransaction(amount);

        showToast(`Successfully staked ${amount} CSPR!`, 'success');
        stakeAmountInput.value = '';

        // Reload user data
        loadUserData();
        loadStakingStats();

    } catch (error) {
        console.error('Stake error:', error);
        showToast('Failed to stake. Please try again.', 'error');
    } finally {
        stakeButton.textContent = 'Stake Now';
        stakeButton.disabled = false;
    }
}

// Simulate stake transaction (for development)
async function simulateStakeTransaction(amount) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Staked ${amount} CSPR`);

            // Add to transaction history
            addTransactionToHistory({
                type: 'Stake',
                amount: amount,
                timestamp: new Date(),
                status: 'Success'
            });

            resolve();
        }, 2000);
    });
}

// Calculate estimated rewards
function calculateRewards() {
    const amount = parseFloat(stakeAmountInput.value) || 0;
    const apy = 0.125; // 12.5%
    const estimatedYearlyRewards = amount * apy;

    estRewardsEl.textContent = `${estimatedYearlyRewards.toFixed(2)} CSPR/year`;
}

// Add transaction to history UI
function addTransactionToHistory(tx) {
    const txHistory = document.getElementById('tx-history');

    // Remove empty state if exists
    const emptyState = txHistory.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    const txElement = document.createElement('div');
    txElement.className = 'tx-item';
    txElement.innerHTML = `
        <div style="display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--border);">
            <div>
                <strong>${tx.type}</strong>
                <br>
                <small style="color: var(--text-secondary);">${tx.timestamp.toLocaleString()}</small>
            </div>
            <div style="text-align: right;">
                <strong style="color: var(--accent);">${tx.amount.toFixed(2)} CSPR</strong>
                <br>
                <small style="color: var(--success);">${tx.status}</small>
            </div>
        </div>
    `;

    txHistory.prepend(txElement);
}

// Set maximum amount
function setMaxAmount() {
    const balance = walletBalance.textContent.replace(' CSPR', '');
    if (balance !== '-') {
        stakeAmountInput.value = parseFloat(balance) - 10; // Leave 10 CSPR for fees
        calculateRewards();
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Utility: Format large numbers
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    return num.toFixed(2);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        connectWallet,
        handleStake,
        calculateRewards,
        formatNumber
    };
}
