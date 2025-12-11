// StakeVue Runtime Configuration V14
// This file is loaded at runtime, not bundled - allows config changes without rebuild

window.config = {
  // Smart Contract Configuration - V14 (integrated SubModule<Cep18> token)
  // V14 Package Hash: hash-e55ad54bcc8fa35710ca8776675cb79d044a467368c143c2c2771aa150cec696
  // Features: stake() payable, unstake(amount), integrated stCSPR token minting/burning
  contract_hash: "", // Not used - kept for backwards compatibility
  contract_package_hash: "e55ad54bcc8fa35710ca8776675cb79d044a467368c143c2c2771aa150cec696",

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
