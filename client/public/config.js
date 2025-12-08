// StakeVue Runtime Configuration
// This file is loaded at runtime, not bundled - allows config changes without rebuild

window.config = {
  // Smart Contract Configuration
  // V5.0 (demo): Internal tracking only, no real CSPR transfers
  // V6.1 (real): Real CSPR transfers via source_purse parameter
  contract_hash: "hash-3a209b27d48b8e288a52f1c4973bf4be290366214de728a65d4e2d3fb5f65d80", // V5.0 (stable)
  contract_hash_v61: "hash-d59ba3b52cbf5678f4a3e926e40758316b1119abd3cf8dbdd07300f601e42499", // V6.1 (needs debugging)
  contract_package_hash: "da7ec3951ab01e272bd340cbd69344814755da63f0b60016f56ebd90ae10e82a",

  // Enable real CSPR transfers (V6.1 contract with source_purse)
  // Set to false to use demo mode (V5.0 behavior)
  use_real_transfers: false,

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
