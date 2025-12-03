// StakeVue Runtime Configuration
// This file is loaded at runtime, not bundled - allows config changes without rebuild

window.config = {
  // Smart Contract Configuration
  contract_hash: "hash-010456c5cfb4b5157854f325f0980e2c504cbce2dfcb5fafce31b7b0a84538652c",
  contract_package_hash: "010456c5cfb4b5157854f325f0980e2c504cbce2dfcb5fafce31b7b0a84538652c",

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
