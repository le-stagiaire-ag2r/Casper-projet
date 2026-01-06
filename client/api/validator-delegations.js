// Casper RPC endpoint (testnet)
const RPC_URL = 'https://rpc.testnet.casperlabs.io/rpc';
// V22 Contract Package Hash
const CONTRACT_PACKAGE_HASH = '2d6a399bca8c71bb007de1cbcd57c7d6a54dc0283376a08fe6024a33c02b0ad3';
// Rate precision (9 decimals)
const RATE_PRECISION = 1000000000;

// Approved validators from config
const APPROVED_VALIDATORS = [
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
];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Return empty delegations (simplified version)
  return res.status(200).json({
    delegations: APPROVED_VALIDATORS.map(pk => ({
      publicKey: pk,
      delegatedAmount: '0',
      delegatedCspr: 0,
      isActive: false,
    })),
    totalDelegated: 0,
    totalDelegatedMotes: '0',
    validatorCount: 0,
    timestamp: new Date().toISOString(),
    contractHash: CONTRACT_PACKAGE_HASH,
  });
};
