// StakeVue Runtime Configuration
// This file is loaded at runtime, not bundled - allows config changes without rebuild

window.config = {
  // Smart Contract Configuration
  // V5.0 (demo): Internal tracking only, no real CSPR transfers
  // V6.1 (real): Real CSPR transfers via source_purse parameter
  contract_hash: "hash-3c013f440de37d956467017c71ccf264bb12f657929b07f21c89bea3dd768996", // V6.1 (real transfers)
  contract_hash_v50: "hash-3a209b27d48b8e288a52f1c4973bf4be290366214de728a65d4e2d3fb5f65d80", // V5.0 (demo backup)
  contract_package_hash: "25e98bf8a22d00b479d0331e9a2ad9d9ebf2ccb4c40dec560e9d6ffdc17d47af",

  // Enable real CSPR transfers (V6.1 contract with source_purse)
  // Set to false to use demo mode (V5.0 behavior)
  use_real_transfers: true,

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
