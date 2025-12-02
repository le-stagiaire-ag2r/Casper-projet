import {
  Deploy,
  DeployHeader,
  ExecutableDeployItem,
  StoredContractByHash,
  ContractHash,
  PublicKey,
  Args,
  CLValue,
} from 'casper-js-sdk';
import config from './config';

// Convert CSPR to motes (1 CSPR = 1,000,000,000 motes)
export const csprToMotes = (cspr: string): string => {
  const amount = parseFloat(cspr);
  const motes = Math.floor(amount * 1_000_000_000);
  return motes.toString();
};

// Convert motes to CSPR
export const motesToCspr = (motes: string): string => {
  const amount = parseInt(motes);
  return (amount / 1_000_000_000).toFixed(9);
};

/**
 * Creates a deposit (stake) transaction using Deploy.makeDeploy() pattern
 * This pattern is more stable for Vercel builds than ContractCallBuilder
 */
export const createStakeTransaction = (
  publicKeyHex: string,
  amountCspr: string
): { transaction: { Version1: any } } => {
  const amountMotes = csprToMotes(amountCspr);
  const paymentMotes = csprToMotes('5'); // 5 CSPR payment

  // Remove 'contract-' prefix if present
  const contractHashHex = config.contractHash.startsWith('contract-')
    ? config.contractHash.substring(9)
    : config.contractHash;

  // Build runtime arguments
  const args = Args.fromMap({
    amount: CLValue.newCLUInt512(amountMotes),
  });

  // Create session using StoredContractByHash
  const session = new ExecutableDeployItem();
  session.storedContractByHash = new StoredContractByHash(
    ContractHash.newContract(contractHashHex),
    'stake', // Entry point name
    args
  );

  // Create deploy header
  const deployHeader = DeployHeader.default();
  deployHeader.account = PublicKey.fromHex(publicKeyHex);
  deployHeader.chainName = config.casperChainName;

  // Standard payment
  const payment = ExecutableDeployItem.standardPayment(paymentMotes);

  // Build deploy
  const deploy = Deploy.makeDeploy(deployHeader, payment, session);

  // Return in Version1 wrapper format for CSPR.click
  return { transaction: { Version1: deploy } };
};

/**
 * Creates an unstake transaction
 */
export const createUnstakeTransaction = (
  publicKeyHex: string,
  amountCspr: string
): { transaction: { Version1: any } } => {
  const amountMotes = csprToMotes(amountCspr);
  const paymentMotes = csprToMotes('5'); // 5 CSPR payment

  // Remove 'contract-' prefix if present
  const contractHashHex = config.contractHash.startsWith('contract-')
    ? config.contractHash.substring(9)
    : config.contractHash;

  // Build runtime arguments
  const args = Args.fromMap({
    amount: CLValue.newCLUInt512(amountMotes),
  });

  // Create session using StoredContractByHash
  const session = new ExecutableDeployItem();
  session.storedContractByHash = new StoredContractByHash(
    ContractHash.newContract(contractHashHex),
    'unstake', // Entry point name
    args
  );

  // Create deploy header
  const deployHeader = DeployHeader.default();
  deployHeader.account = PublicKey.fromHex(publicKeyHex);
  deployHeader.chainName = config.casperChainName;

  // Standard payment
  const payment = ExecutableDeployItem.standardPayment(paymentMotes);

  // Build deploy
  const deploy = Deploy.makeDeploy(deployHeader, payment, session);

  // Return in Version1 wrapper format for CSPR.click
  return { transaction: { Version1: deploy } };
};
