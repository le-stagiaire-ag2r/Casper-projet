// StakeVue Runtime Configuration V9
// This file is loaded at runtime, not bundled - allows config changes without rebuild

window.config = {
  // Smart Contract Configuration - V10 (fresh deploy with token in init)
  // V10 Package Hash: hash-d1857d850653ebc0aaf13fffd7610b9e3f4794dfefae158b193edf11a5dd62e3
  contract_hash: "", // Not used - kept for backwards compatibility
  contract_package_hash: "d1857d850653ebc0aaf13fffd7610b9e3f4794dfefae158b193edf11a5dd62e3",

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
