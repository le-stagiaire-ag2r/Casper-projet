// StakeVue Runtime Configuration V15
// This file is loaded at runtime, not bundled - allows config changes without rebuild

window.config = {
  // Smart Contract Configuration - V15 (Exchange Rate mechanism)
  // V15 Package Hash: hash-2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985
  // Features: stake(), unstake(), add_rewards(), get_exchange_rate(), dynamic stCSPR appreciation
  contract_hash: "", // Not used - kept for backwards compatibility
  contract_package_hash: "2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985",

  // Contract owner address (for admin features like add_rewards)
  owner_account_hash: "2f63ef2c9db78bcf2288529e2217cd8e70614f0b1aad4f8ef8871acd39ac2f7e",

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
  add_rewards_payment: "10000000000", // 10 CSPR gas for add_rewards

  // Staking Configuration
  min_stake_amount: "1000000000", // 1 CSPR minimum

  // V15 Exchange Rate
  rate_precision: 1000000000, // 1.0 = 1_000_000_000
};
