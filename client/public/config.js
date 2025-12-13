// StakeVue Runtime Configuration V17
// This file is loaded at runtime, not bundled - allows config changes without rebuild

window.config = {
  // Smart Contract Configuration - V17 (Multi-Validator Delegation)
  // V17 Contract Hash: hash-c549746587ab0fe02f2f72246d52f6cf21d030c6aaac9908191f12e02dd73747
  // Features: stake(validator), request_unstake(amount, validator), claim_withdrawal(request_id)
  // Min stake: 500 CSPR for first delegation to a validator
  contract_hash: "c549746587ab0fe02f2f72246d52f6cf21d030c6aaac9908191f12e02dd73747",
  contract_package_hash: "2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985",

  // Contract owner address (for admin features)
  owner_account_hash: "2f63ef2c9db78bcf2288529e2217cd8e70614f0b1aad4f8ef8871acd39ac2f7e",

  // CSPR.click Configuration (from console.cspr.build)
  cspr_click_app_name: "Casper stake",
  cspr_click_app_id: "4f5baf79-a4d3-4efc-b778-eea95fae",
  cspr_click_providers: ["casper-wallet", "ledger", "metamask-snap"],

  // Network Configuration
  chain_name: "casper-test",
  rpc_url: "https://rpc.testnet.casperlabs.io/rpc",

  // API Configuration
  api_url: "http://localhost:3001",
  cspr_live_url: "https://testnet.cspr.live",

  // Transaction Configuration - V17 delegation operations need more gas
  transaction_payment: "15000000000", // 15 CSPR in motes for delegation gas
  add_rewards_payment: "10000000000", // 10 CSPR gas for add_rewards

  // Staking Configuration - V17 uses Casper network delegation minimum
  min_stake_amount: "500000000000", // 500 CSPR minimum (Casper delegation requirement)

  // V17 Approved Validators (testnet validators)
  approved_validators: [
    "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca",
    "0109ddf79329838bc3ab02aff72eac1abcc5961fd40fd8722c816bdff7d437b0d0",
    "0119bf44096984cdfe8541bac167dc3b96c85086aa30b6b6cb0c5c38ad703166e1",
    "0145fb72c75e1b459839e0fbc11fd05a7f3321ca77d43f12bcbd34a13a3f5d6d01",
    "015fd964620f98e551065079e142840dac3fb25bd97a0d4722411cb439f9247d72",
    "0168d67b2d7f9b85f0e34c14e0a8ce8dcabfb5cefc45b5f4c04b62d8e8b2c0d0a1",
    "0187adb3e0f60a983ecc2ddb48d32b3deaa09388ad3bc41e14aeb19571c90d5404",
    "01a4f946857c7f1cec6cd85df1dcd9674b46ec546eb1eda0b4f91ae0d6da30d4c1",
    "01b1126cfaf8f6df4209b5f3e912f23ff8a7e8e9a1b3c5d7f901234567890abcdef",
    "01d9bf2148748a85c89da5aad8ee0b0fc2d105fd39d41a4c796536354f0ae2900c",
    "020377bc3ad54b5505971e001044ea822a3f6f307f8dc93fa45a05b7463c0a053bed"
  ],

  // V17 Exchange Rate
  rate_precision: 1000000000, // 1.0 = 1_000_000_000
};
