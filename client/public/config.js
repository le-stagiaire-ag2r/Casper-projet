// StakeVue Runtime Configuration V9
// This file is loaded at runtime, not bundled - allows config changes without rebuild

window.config = {
  // Smart Contract Configuration - V9 with stCSPR token integration
  // V9 Package Hash: hash-c977c574e95ec91df64d2354f170542a019bb716dcd6268f301b27412d107e8b
  // Token V3: hash-938972a16eba403529c2c76aa1727a026fc1aa328f553185daba45703213f6bc
  contract_hash: "", // Not used - kept for backwards compatibility
  contract_package_hash: "c977c574e95ec91df64d2354f170542a019bb716dcd6268f301b27412d107e8b",

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
