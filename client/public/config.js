// StakeVue Runtime Configuration
// This file is loaded at runtime, not bundled - allows config changes without rebuild

window.config = {
  // Smart Contract Configuration (deployed on Casper Testnet - protocol 2.0.4)
  contract_hash: "hash-3a209b27d48b8e288a52f1c4973bf4be290366214de728a65d4e2d3fb5f65d80",
  contract_package_hash: "cddd48ce2ca6673fe9f7d00328b4dcc825d60de0316422b4217f9e88d0690157",

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
