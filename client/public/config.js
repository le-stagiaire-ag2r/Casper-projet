// StakeVue Runtime Configuration V8.2
// This file is loaded at runtime, not bundled - allows config changes without rebuild

window.config = {
  // Smart Contract Configuration - V8.2 (stable version)
  // V8.2 Package Hash: hash-822196e8212ae0e6f1b9d5e158091b6b9e97501b120e16693d4bb9da1bc602de
  contract_hash: "", // Not used - kept for backwards compatibility
  contract_package_hash: "822196e8212ae0e6f1b9d5e158091b6b9e97501b120e16693d4bb9da1bc602de",

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
