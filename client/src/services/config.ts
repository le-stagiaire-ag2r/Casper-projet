export const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  casperNetwork: process.env.REACT_APP_CASPER_NETWORK || 'casper-test',
  casperChainName: process.env.REACT_APP_CASPER_CHAIN_NAME || 'casper-test',
  contractHash: process.env.REACT_APP_CONTRACT_HASH || '',
  contractPackageHash: process.env.REACT_APP_CONTRACT_PACKAGE_HASH || '',
  csprCloudUrl: process.env.REACT_APP_CSPR_CLOUD_URL || 'https://api.testnet.cspr.cloud',
  csprClickAppId: process.env.REACT_APP_CSPRCLICK_APP_ID || '',
  csprClickAppKey: process.env.REACT_APP_CSPRCLICK_APP_KEY || '',
  // V17: Approved validators list (comma-separated public keys)
  approvedValidators: (process.env.REACT_APP_APPROVED_VALIDATORS || '').split(',').filter(v => v.length > 0),
  // V17: Min stake 500 CSPR for first delegation
  minStakeAmount: process.env.REACT_APP_MIN_STAKE_AMOUNT || '500000000000',
};

// Validation
if (!config.contractHash) {
  console.warn('⚠️  WARNING: REACT_APP_CONTRACT_HASH is not set!');
}

if (!config.csprClickAppId) {
  console.warn('⚠️  WARNING: REACT_APP_CSPRCLICK_APP_ID is not set!');
}

export default config;
