import express, { Request, Response } from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { initializeDatabase } from './data-source';
import { StakeRepository } from './repository/StakeRepository';
import { ValidatorRepository } from './repository/ValidatorRepository';
import { CSPRCloudAPIClient } from './cspr-cloud/CSPRCloudAPIClient';
import { paginationMiddleware } from './middleware/pagination';
import config from './config';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Initialize repositories
let stakeRepository: StakeRepository;
let validatorRepository: ValidatorRepository;
const csprCloudClient = new CSPRCloudAPIClient();

// Health check
app.get('/health', async (req: Request, res: Response) => {
  try {
    await stakeRepository.count();
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: 'Database connection failed' });
  }
});

// Proxy CSPR.cloud account endpoint
app.use(
  '/accounts/:account_hash',
  createProxyMiddleware({
    target: config.csprCloudUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/accounts': '/accounts',
    },
    onProxyReq: (proxyReq) => {
      proxyReq.setHeader('Authorization', `Bearer ${config.csprCloudAccessKey}`);
    },
  })
);

// Get user stakes
app.get('/stakes/:account_hash', paginationMiddleware, async (req: Request, res: Response) => {
  try {
    const { account_hash } = req.params;
    const { limit, offset } = req.pagination!;

    const stakes = await stakeRepository.findByUserAccount(account_hash, limit, offset);
    const enrichedStakes = await csprCloudClient.withPublicKeys(stakes);
    const total = await stakeRepository.countByUser(account_hash);

    res.json({
      data: enrichedStakes,
      pagination: {
        limit,
        offset,
        total,
      },
    });
  } catch (error) {
    console.error('Error fetching user stakes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent stakes
app.get('/stakes', paginationMiddleware, async (req: Request, res: Response) => {
  try {
    const { limit, offset } = req.pagination!;

    const stakes = await stakeRepository.findRecent(limit, offset);
    const enrichedStakes = await csprCloudClient.withPublicKeys(stakes);
    const total = await stakeRepository.count();

    res.json({
      data: enrichedStakes,
      pagination: {
        limit,
        offset,
        total,
      },
    });
  } catch (error) {
    console.error('Error fetching stakes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get total staked (TVL)
app.get('/total-staked', async (req: Request, res: Response) => {
  try {
    const totalStaked = await stakeRepository.getTotalStaked();
    res.json({ totalStaked });
  } catch (error) {
    console.error('Error fetching total staked:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user total staked
app.get('/user-staked/:account_hash', async (req: Request, res: Response) => {
  try {
    const { account_hash } = req.params;
    const userStaked = await stakeRepository.getUserTotalStaked(account_hash);
    res.json({ accountHash: account_hash, totalStaked: userStaked });
  } catch (error) {
    console.error('Error fetching user staked:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all validators
app.get('/validators', async (req: Request, res: Response) => {
  try {
    const validators = await validatorRepository.findAll();
    res.json({ data: validators });
  } catch (error) {
    console.error('Error fetching validators:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active validators
app.get('/validators/active', async (req: Request, res: Response) => {
  try {
    const validators = await validatorRepository.findActive();
    res.json({ data: validators });
  } catch (error) {
    console.error('Error fetching active validators:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();

    // Initialize repositories
    stakeRepository = new StakeRepository();
    validatorRepository = new ValidatorRepository();

    // Start listening
    app.listen(config.httpPort, () => {
      console.log(`✅ API Server running on http://localhost:${config.httpPort}`);
      console.log(`   - Health check: http://localhost:${config.httpPort}/health`);
      console.log(`   - Total staked: http://localhost:${config.httpPort}/total-staked`);
      console.log(`   - Validators: http://localhost:${config.httpPort}/validators`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
