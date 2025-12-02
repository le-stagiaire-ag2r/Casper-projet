import dotenv from 'dotenv';

dotenv.config();

interface Config {
  httpPort: number;
  dbUri: string;
  csprCloudUrl: string;
  csprCloudStreamingUrl: string;
  csprCloudAccessKey: string;
  contractHash: string;
  contractPackageHash: string;
  timezone: string;
  pingCheckIntervalInMilliseconds: number;
}

const config: Config = {
  httpPort: parseInt(process.env.HTTP_PORT || '3001', 10),
  dbUri: process.env.DB_URI || 'mysql://root:password@localhost:3306/stakevue',
  csprCloudUrl: process.env.CSPR_CLOUD_URL || 'https://api.testnet.cspr.cloud',
  csprCloudStreamingUrl: process.env.CSPR_CLOUD_STREAMING_URL || 'wss://streaming.testnet.cspr.cloud',
  csprCloudAccessKey: process.env.CSPR_CLOUD_ACCESS_KEY || '',
  contractHash: process.env.CONTRACT_HASH || '',
  contractPackageHash: process.env.CONTRACT_PACKAGE_HASH || '',
  timezone: process.env.TZ || 'UTC',
  pingCheckIntervalInMilliseconds: 30000, // 30 seconds
};

// Validation
if (!config.csprCloudAccessKey) {
  console.warn('⚠️  WARNING: CSPR_CLOUD_ACCESS_KEY is not set!');
}

if (!config.contractPackageHash) {
  console.warn('⚠️  WARNING: CONTRACT_PACKAGE_HASH is not set!');
}

export default config;
