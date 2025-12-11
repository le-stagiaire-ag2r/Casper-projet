#!/usr/bin/env node
/**
 * StakeVue Auto-Rewards Script
 *
 * Automatically distributes staking rewards to the contract.
 * Run periodically (e.g., daily) via cron or GitHub Actions.
 *
 * Usage:
 *   PRIVATE_KEY=<hex> REWARD_AMOUNT=<cspr> node add-rewards.js
 *
 * Environment Variables:
 *   PRIVATE_KEY     - Owner's private key (hex, without 0x prefix)
 *   REWARD_AMOUNT   - Amount of CSPR to add as rewards (default: 1)
 *   RPC_URL         - Casper RPC endpoint (default: testnet)
 *   CONTRACT_HASH   - Contract package hash
 */

import dotenv from 'dotenv';
dotenv.config();

// Configuration
const RPC_URL = process.env.RPC_URL || 'https://rpc.testnet.casperlabs.io/rpc';
const CONTRACT_PACKAGE_HASH = process.env.CONTRACT_HASH || '2b6c14a2cac5cfe4a1fd1efc2fc02b1090dbc3a6b661a329b90c829245540985';
const CHAIN_NAME = process.env.CHAIN_NAME || 'casper-test';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const REWARD_AMOUNT = parseFloat(process.env.REWARD_AMOUNT || '1'); // in CSPR
const PAYMENT_AMOUNT = 3_000_000_000; // 3 CSPR for gas

// Convert CSPR to motes
const MOTES_PER_CSPR = 1_000_000_000n;
const rewardMotes = BigInt(Math.floor(REWARD_AMOUNT * 1_000_000_000));

async function main() {
  console.log('=== StakeVue Auto-Rewards Script ===');
  console.log(`Network: ${CHAIN_NAME}`);
  console.log(`Contract: ${CONTRACT_PACKAGE_HASH}`);
  console.log(`Reward Amount: ${REWARD_AMOUNT} CSPR (${rewardMotes} motes)`);
  console.log('');

  if (!PRIVATE_KEY) {
    console.error('ERROR: PRIVATE_KEY environment variable is required');
    console.error('Set your owner private key (hex format) to sign the transaction');
    process.exit(1);
  }

  try {
    // Dynamic import for ESM compatibility
    const { CasperClient, Keys, DeployUtil, RuntimeArgs, CLValueBuilder } = await import('casper-js-sdk');

    // Create Casper client
    const client = new CasperClient(RPC_URL);

    // Load key pair from private key
    console.log('Loading owner key pair...');
    const privateKeyBytes = Uint8Array.from(Buffer.from(PRIVATE_KEY, 'hex'));

    // Determine key type (Ed25519 = 32 bytes, Secp256k1 = 32 bytes for private)
    let keyPair;
    try {
      keyPair = Keys.Ed25519.parseKeyPair(
        new Uint8Array(32), // Public key will be derived
        privateKeyBytes
      );
    } catch {
      // Try Secp256k1
      keyPair = Keys.Secp256K1.parseKeyPair(
        new Uint8Array(33), // Public key will be derived
        privateKeyBytes
      );
    }

    const publicKey = keyPair.publicKey;
    console.log(`Owner Public Key: ${publicKey.toHex()}`);

    // Build the add_rewards deploy
    console.log('\nBuilding add_rewards transaction...');

    // Create runtime args (empty for add_rewards - amount comes from attached value)
    const args = RuntimeArgs.fromMap({});

    // Create the contract call deploy
    const deploy = DeployUtil.makeDeploy(
      new DeployUtil.DeployParams(
        publicKey,
        CHAIN_NAME,
        1, // Gas price
        1800000 // TTL: 30 minutes
      ),
      DeployUtil.ExecutableDeployItem.newStoredContractByHash(
        Uint8Array.from(Buffer.from(CONTRACT_PACKAGE_HASH, 'hex')),
        'add_rewards',
        args
      ),
      DeployUtil.standardPayment(PAYMENT_AMOUNT + Number(rewardMotes)) // Payment includes reward amount
    );

    // Sign the deploy
    console.log('Signing transaction...');
    const signedDeploy = DeployUtil.signDeploy(deploy, keyPair);

    // Send to network
    console.log('Sending to network...');
    const deployHash = await client.putDeploy(signedDeploy);
    console.log(`\nDeploy Hash: ${deployHash}`);
    console.log(`Explorer: https://testnet.cspr.live/deploy/${deployHash}`);

    // Wait for execution
    console.log('\nWaiting for execution (this may take 1-2 minutes)...');

    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max

    while (attempts < maxAttempts) {
      await sleep(5000); // Wait 5 seconds between checks
      attempts++;

      try {
        const result = await client.getDeploy(deployHash);
        const executionResults = result[1]?.execution_results;

        if (executionResults && executionResults.length > 0) {
          const execResult = executionResults[0].result;

          if (execResult.Success) {
            console.log('\n=== SUCCESS ===');
            console.log(`Rewards of ${REWARD_AMOUNT} CSPR added to the pool!`);
            console.log('The exchange rate has been updated.');
            process.exit(0);
          } else if (execResult.Failure) {
            console.error('\n=== FAILED ===');
            console.error('Error:', execResult.Failure.error_message);
            process.exit(1);
          }
        }
      } catch (err) {
        // Deploy not yet processed, continue waiting
        process.stdout.write('.');
      }
    }

    console.log('\n\nTimeout waiting for deploy execution.');
    console.log('Check the explorer for status:', `https://testnet.cspr.live/deploy/${deployHash}`);
    process.exit(1);

  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main();
