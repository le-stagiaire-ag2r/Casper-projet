// StakeVue Runtime Configuration
// This file is loaded at runtime, not bundled - allows config changes without rebuild

window.config = {
  // Smart Contract Configuration
  contract_hash: "hash-YOUR_CONTRACT_HASH_HERE",
  contract_package_hash: "YOUR_CONTRACT_PACKAGE_HASH_HERE",

  // CSPR.click Configuration
  cspr_click_app_name: "StakeVue",
  cspr_click_app_id: "stakevue-testnet",
  cspr_click_providers: ["casper-wallet", "ledger", "metamask-snap"],

  // Network Configuration
  chain_name: "casper-test",

  // API Configuration
  api_url: "http://localhost:3001",
  cspr_live_url: "https://testnet.cspr.live",

  // Transaction Configuration
  transaction_payment: "5000000000", // 5 CSPR in motes for gas

  // Staking Configuration
  min_stake_amount: "1000000000", // 1 CSPR minimum
};
