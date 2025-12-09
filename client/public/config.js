// StakeVue Runtime Configuration V8.1
// This file is loaded at runtime, not bundled - allows config changes without rebuild

window.config = {
  // Smart Contract Configuration - V8 Odra Contract (Casper Testnet)
  // V8 uses package_hash with proxy_caller.wasm for payable functions
  contract_hash: "", // Not used in V8 - kept for backwards compatibility
  contract_package_hash: "f9205d8ad33cfb7fd47873babc4bc3388098beaea3573e7b8a69800dab9d68e4",

  // CSPR.click Configuration (from console.cspr.build)
  cspr_click_app_name: "Casper stake",
  cspr_click_app_id: "4f5baf79-a4d3-4efc-b778-eea95fae",
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
