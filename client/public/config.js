// StakeVue Runtime Configuration V9
// This file is loaded at runtime, not bundled - allows config changes without rebuild

window.config = {
  // Smart Contract Configuration - V9 Odra Contract with CEP-18 stCSPR Token
  // V9 uses package_hash with proxy_caller.wasm for payable functions
  contract_hash: "", // Not used - kept for backwards compatibility
  contract_package_hash: "ab4f4780daef5aca3c3c36cad559c93714938b80e6778e087bb645b0af2d635f",

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
