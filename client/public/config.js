// StakeVue Runtime Configuration V21 (Odra 2.5.0)
// This file is loaded at runtime, not bundled - allows config changes without rebuild

window.config = {
  // Smart Contract Configuration - V21 (Odra 2.5.0 Upgrade)
  // V21 Contract Hash: hash-550546bc677e6712faa79b280469c1c550031f825e5d95d038b235d22e83b655
  // Features: stake(validator) -> pool, request_unstake(amount) -> burn only, claim(request_id)
  // Architecture: Pool-based like Wise Lending - admin handles delegate/undelegate
  // Upgrade: Odra 2.5.0 with improved validator support
  contract_hash: "550546bc677e6712faa79b280469c1c550031f825e5d95d038b235d22e83b655",
  // V21 package hash
  contract_package_hash: "550546bc677e6712faa79b280469c1c550031f825e5d95d038b235d22e83b655",

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

  // Transaction Configuration - V21 pool operations (no direct delegation)
  transaction_payment: "10000000000", // 10 CSPR in motes for gas
  add_rewards_payment: "10000000000", // 10 CSPR gas for add_rewards

  // Staking Configuration - V21 (500 CSPR minimum for delegation)
  min_stake_amount: "500000000000", // 500 CSPR minimum (Casper delegation requirement)

  // V21 Approved Validators (testnet validators - synced with .env.example)
  approved_validators: [
    "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca",
    "017d96b9a63abcb61c870a4f55187a0a7ac24096bdb5fc585c12a686a4d892009e",
    "017d9aa0b86413d7ff9a9169182c53f0bacaa80d34c211adab007ed4876af17077",
    "012d58e05b2057a84115709e0a6ccf000c6a83b4e8dfa389a680c1ab001864f1f2",
    "0143345f0d7c6e8d1a8e70eecdc3b4801d6b8505cd56c422b56d806b3efd1ebfda",
    "012b365e09c5d75187b4abc25c4aa28109133bab6a256ef4abe24348073e590d80",
    "0153d98c835b493c76050735dc79e6702a17cd78ab69d5b0c3631e72f8f38bb095",
    "013584d18def5ee3ef33374b3e2c9056bbb7860c97044bd16b64d895f8aa073084",
    "01a4a5517e0b83b7cbccae0cc22fb4a03d5c5a3d15c6b6bd7a6f4747e541bea779",
    "01a7cfb168d2bc2f69f90627d5e7bc6cb019b1c52c8a374416fdb9c4cef0233611",
    "01f340df2c32f25391e8f7924a99e93cab3a6f230ff7af1cacbfc070772cbebd94"
  ],

  // V21 Exchange Rate
  rate_precision: 1000000000, // 1.0 = 1_000_000_000
};
