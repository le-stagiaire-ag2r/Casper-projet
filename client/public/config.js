// StakeVue Runtime Configuration
// This file is loaded at runtime, not bundled - allows config changes without rebuild

window.config = {
  // Smart Contract Configuration V6.1 - Real CSPR transfers with purse params (deployed on Casper Testnet)
  contract_hash: "hash-d59ba3b52cbf5678f4a3e926e40758316b1119abd3cf8dbdd07300f601e42499",
  contract_package_hash: "da7ec3951ab01e272bd340cbd69344814755da63f0b60016f56ebd90ae10e82a",

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
