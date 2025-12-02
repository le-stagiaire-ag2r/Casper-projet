import WebSocket from 'ws';
import { initializeDatabase } from './data-source';
import { StakeRepository } from './repository/StakeRepository';
import { ValidatorRepository } from './repository/ValidatorRepository';
import config from './config';
import { WebSocketMessage, ContractEvent, StakeEvent, UnstakeEvent, TransferEvent } from './events';

let stakeRepository: StakeRepository;
let validatorRepository: ValidatorRepository;

let lastPingTimestamp = Date.now();
let ws: WebSocket | null = null;

const connectToBlockchainStream = () => {
  const streamUrl = `${config.csprCloudStreamingUrl}/contract-events?contract_package_hash=${config.contractPackageHash}`;

  console.log(`🔗 Connecting to blockchain event stream...`);
  console.log(`   URL: ${streamUrl}`);

  ws = new WebSocket(streamUrl, {
    headers: {
      Authorization: `Bearer ${config.csprCloudAccessKey}`,
    },
  });

  ws.on('open', () => {
    console.log('✅ Connected to blockchain event stream');
    lastPingTimestamp = Date.now();
  });

  ws.on('message', async (data: WebSocket.Data) => {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());

      if (message.type === 'ping') {
        lastPingTimestamp = Date.now();
        console.log('💓 Ping received');
      } else if (message.type === 'contract_event') {
        await handleContractEvent(message.data);
      }
    } catch (error) {
      console.error('❌ Error processing WebSocket message:', error);
    }
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('⚠️  WebSocket connection closed');
    // Reconnect after 5 seconds
    setTimeout(() => {
      console.log('🔄 Reconnecting...');
      connectToBlockchainStream();
    }, 5000);
  });
};

const handleContractEvent = async (event: ContractEvent) => {
  console.log(`📥 Contract event received: ${event.event_type}`);
  console.log(`   Block: ${event.block_height}`);
  console.log(`   Deploy: ${event.deploy_hash}`);

  try {
    switch (event.event_type) {
      case 'Stake':
      case 'stake':
        await handleStakeEvent(event);
        break;

      case 'Unstake':
      case 'unstake':
        await handleUnstakeEvent(event);
        break;

      case 'Transfer':
      case 'transfer_stcspr':
        await handleTransferEvent(event);
        break;

      case 'ValidatorAdded':
      case 'validator_added':
        await handleValidatorAddedEvent(event);
        break;

      case 'ValidatorRemoved':
      case 'validator_removed':
        await handleValidatorRemovedEvent(event);
        break;

      default:
        console.log(`⚠️  Unknown event type: ${event.event_type}`);
    }
  } catch (error) {
    console.error('❌ Error handling contract event:', error);
  }
};

const handleStakeEvent = async (event: ContractEvent) => {
  const eventData: StakeEvent = event.event_data;

  // Check if already exists
  const existing = await stakeRepository.findByTxHash(event.deploy_hash);
  if (existing) {
    console.log(`   ⏭️  Stake event already processed (tx: ${event.deploy_hash})`);
    return;
  }

  await stakeRepository.save({
    userAccountHash: eventData.user,
    actionType: 'stake',
    amount: eventData.amount,
    stCsprAmount: eventData.st_cspr_amount,
    txHash: event.deploy_hash,
    blockHeight: event.block_height,
    timestamp: new Date(event.timestamp),
  });

  console.log(`   ✅ Stake saved: ${eventData.amount} motes by ${eventData.user.substring(0, 10)}...`);
};

const handleUnstakeEvent = async (event: ContractEvent) => {
  const eventData: UnstakeEvent = event.event_data;

  const existing = await stakeRepository.findByTxHash(event.deploy_hash);
  if (existing) {
    console.log(`   ⏭️  Unstake event already processed (tx: ${event.deploy_hash})`);
    return;
  }

  await stakeRepository.save({
    userAccountHash: eventData.user,
    actionType: 'unstake',
    amount: eventData.amount,
    stCsprAmount: eventData.st_cspr_amount,
    txHash: event.deploy_hash,
    blockHeight: event.block_height,
    timestamp: new Date(event.timestamp),
  });

  console.log(`   ✅ Unstake saved: ${eventData.amount} motes by ${eventData.user.substring(0, 10)}...`);
};

const handleTransferEvent = async (event: ContractEvent) => {
  const eventData: TransferEvent = event.event_data;

  const existing = await stakeRepository.findByTxHash(event.deploy_hash);
  if (existing) {
    console.log(`   ⏭️  Transfer event already processed (tx: ${event.deploy_hash})`);
    return;
  }

  await stakeRepository.save({
    userAccountHash: eventData.from,
    actionType: 'transfer',
    amount: '0', // No CSPR transferred, only stCSPR
    stCsprAmount: eventData.amount,
    recipientAccountHash: eventData.to,
    txHash: event.deploy_hash,
    blockHeight: event.block_height,
    timestamp: new Date(event.timestamp),
  });

  console.log(`   ✅ Transfer saved: ${eventData.amount} stCSPR from ${eventData.from.substring(0, 10)}... to ${eventData.to.substring(0, 10)}...`);
};

const handleValidatorAddedEvent = async (event: ContractEvent) => {
  const eventData = event.event_data;

  const existing = await validatorRepository.findByPublicKey(eventData.validator);
  if (existing) {
    await validatorRepository.activate(eventData.validator);
    console.log(`   ✅ Validator reactivated: ${eventData.validator.substring(0, 20)}...`);
  } else {
    await validatorRepository.save({
      publicKey: eventData.validator,
      totalStaked: '0',
      isActive: true,
      addedAt: new Date(event.timestamp),
    });
    console.log(`   ✅ Validator added: ${eventData.validator.substring(0, 20)}...`);
  }
};

const handleValidatorRemovedEvent = async (event: ContractEvent) => {
  const eventData = event.event_data;

  await validatorRepository.deactivate(eventData.validator);
  console.log(`   ✅ Validator deactivated: ${eventData.validator.substring(0, 20)}...`);
};

// Health check for ping messages
const startPingHealthCheck = () => {
  setInterval(() => {
    const timeSinceLastPing = Date.now() - lastPingTimestamp;

    if (timeSinceLastPing > config.pingCheckIntervalInMilliseconds) {
      console.error(`⚠️  No ping received for ${timeSinceLastPing}ms. Connection may be stale.`);
      if (ws) {
        ws.close();
      }
    }
  }, config.pingCheckIntervalInMilliseconds);
};

// Start the event handler
const start = async () => {
  try {
    console.log('🚀 Starting Event Handler...');

    // Initialize database
    await initializeDatabase();

    // Initialize repositories
    stakeRepository = new StakeRepository();
    validatorRepository = new ValidatorRepository();

    console.log('✅ Repositories initialized');

    // Connect to blockchain stream
    connectToBlockchainStream();

    // Start ping health check
    startPingHealthCheck();

    console.log('✅ Event Handler started successfully');
  } catch (error) {
    console.error('❌ Failed to start Event Handler:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  if (ws) ws.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  if (ws) ws.close();
  process.exit(0);
});

// Start the event handler
start();
