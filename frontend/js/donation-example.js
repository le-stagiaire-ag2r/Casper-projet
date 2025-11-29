/**
 * Exemple d'Implémentation - Application de Donation Casper
 * Utilise le proxy RPC pour éviter les erreurs CORS
 *
 * Basé sur : https://github.com/casper-ecosystem/donation-demo/blob/main/tutorial/README.md
 */

import { putDeploy, getDeploy, getAccountInfo } from './casper-rpc-client.js';

// Configuration
const CONTRACT_HASH = 'hash-...'; // Remplacez par le hash de votre contrat de donation
const DONATION_ENTRY_POINT = 'deposit';

/**
 * Effectue une donation en appelant le contrat intelligent
 * @param {string} donorPublicKey - Clé publique du donateur
 * @param {number} amount - Montant en motes (1 CSPR = 1,000,000,000 motes)
 * @param {string} recipient - Adresse du bénéficiaire
 * @returns {Promise<string>} - Hash du deploy
 */
async function makeDonation(donorPublicKey, amount, recipient) {
  try {
    console.log('🎯 Préparation de la donation...');
    console.log('Donateur:', donorPublicKey);
    console.log('Montant:', amount, 'motes');
    console.log('Bénéficiaire:', recipient);

    // 1. Créer le deploy (normalement avec CasperClient SDK)
    // Note: Cette partie doit être faite côté client avec la signature du wallet
    const deploy = await createDonationDeploy(donorPublicKey, amount, recipient);

    console.log('📝 Deploy créé:', deploy);

    // 2. Demander à l'utilisateur de signer avec son wallet
    console.log('✍️ Demande de signature au wallet...');
    const signedDeploy = await signDeployWithWallet(deploy);

    console.log('🔏 Deploy signé');

    // 3. Soumettre le deploy via le proxy (évite CORS!)
    console.log('📋 Soumission au RPC via le proxy...');
    const deployHash = await putDeploy(signedDeploy);

    console.log('✅ Donation soumise avec succès!');
    console.log('Deploy Hash:', deployHash);

    return deployHash;

  } catch (error) {
    console.error('❌ Erreur lors de la donation:', error);
    throw error;
  }
}

/**
 * Suit le statut d'une donation
 * @param {string} deployHash - Hash du deploy à suivre
 * @returns {Promise<object>} - Informations sur le deploy
 */
async function trackDonation(deployHash) {
  try {
    console.log('🔍 Vérification du statut de la donation...');
    console.log('Deploy Hash:', deployHash);

    // Interroger le RPC via le proxy (évite CORS!)
    const deployInfo = await getDeploy(deployHash);

    if (!deployInfo) {
      throw new Error('Deploy introuvable');
    }

    const executionResults = deployInfo.execution_results?.[0];
    const status = executionResults?.result?.Success ? 'Success' : 'Failed';

    console.log('📊 Statut:', status);

    if (status === 'Success') {
      console.log('✅ Donation confirmée sur la blockchain!');
    } else if (status === 'Failed') {
      console.error('❌ La donation a échoué:', executionResults?.result?.Failure);
    }

    return {
      hash: deployHash,
      status: status,
      details: deployInfo,
    };

  } catch (error) {
    console.error('❌ Erreur lors du suivi:', error);
    throw error;
  }
}

/**
 * Obtient le solde d'un compte
 * @param {string} publicKey - Clé publique du compte
 * @returns {Promise<object>} - Informations du compte
 */
async function getBalance(publicKey) {
  try {
    console.log('💰 Récupération du solde...');
    console.log('Compte:', publicKey);

    // Interroger le RPC via le proxy (évite CORS!)
    const accountInfo = await getAccountInfo(publicKey);

    console.log('✅ Informations du compte récupérées');

    return accountInfo;

  } catch (error) {
    console.error('❌ Erreur lors de la récupération du solde:', error);
    throw error;
  }
}

// ============================================================================
// Fonctions d'aide (à adapter selon votre implémentation)
// ============================================================================

/**
 * Crée un deploy pour la donation
 * Note: Utilisez casper-js-sdk pour créer le deploy
 */
async function createDonationDeploy(donorPublicKey, amount, recipient) {
  // Cette fonction doit utiliser casper-js-sdk pour créer le deploy
  // Exemple de structure de base:

  /*
  import { DeployUtil, CLPublicKey, CLU512 } from 'casper-js-sdk';

  const deployParams = new DeployUtil.DeployParams(
    CLPublicKey.fromHex(donorPublicKey),
    'casper-test',
    1,
    1800000
  );

  const args = RuntimeArgs.fromMap({
    recipient: CLPublicKey.fromHex(recipient),
    amount: new CLU512(amount),
  });

  const deploy = DeployUtil.makeDeploy(
    deployParams,
    DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      CONTRACT_HASH,
      DONATION_ENTRY_POINT,
      args
    ),
    DeployUtil.standardPayment(1000000000)
  );

  return deploy;
  */

  console.warn('⚠️ createDonationDeploy: Implémentation à compléter avec casper-js-sdk');
  return {};
}

/**
 * Demande à l'utilisateur de signer le deploy avec son wallet
 * Note: Utilisez CSPR.click ou Casper Signer
 */
async function signDeployWithWallet(deploy) {
  // Cette fonction doit utiliser le wallet de l'utilisateur pour signer
  // Exemple avec CSPR.click:

  /*
  if (!window.csprclick) {
    throw new Error('CSPR.click wallet non détecté');
  }

  const signedDeploy = await window.csprclick.signDeploy(
    deploy,
    donorPublicKey
  );

  return signedDeploy;
  */

  console.warn('⚠️ signDeployWithWallet: Implémentation à compléter avec le wallet');
  return deploy; // Pour l'exemple
}

// ============================================================================
// Exemple d'utilisation dans un composant UI
// ============================================================================

/**
 * Exemple de fonction appelée depuis un bouton "Donate"
 */
async function handleDonateButtonClick() {
  try {
    // 1. Récupérer les valeurs du formulaire
    const donorPublicKey = document.getElementById('donor-address').value;
    const amountCSPR = parseFloat(document.getElementById('amount').value);
    const recipient = document.getElementById('recipient').value;

    // 2. Convertir CSPR en motes (1 CSPR = 1,000,000,000 motes)
    const amountMotes = Math.floor(amountCSPR * 1_000_000_000);

    // 3. Effectuer la donation
    showStatus('Préparation de la transaction...', 'info');
    const deployHash = await makeDonation(donorPublicKey, amountMotes, recipient);

    // 4. Afficher le hash
    showStatus(`Transaction soumise ! Hash: ${deployHash}`, 'success');

    // 5. Suivre le statut (polling toutes les 5 secondes)
    const pollInterval = setInterval(async () => {
      try {
        const status = await trackDonation(deployHash);

        if (status.status === 'Success') {
          clearInterval(pollInterval);
          showStatus('✅ Donation confirmée !', 'success');
        } else if (status.status === 'Failed') {
          clearInterval(pollInterval);
          showStatus('❌ Donation échouée', 'error');
        }
      } catch (error) {
        console.error('Erreur lors du polling:', error);
      }
    }, 5000);

  } catch (error) {
    console.error('Erreur:', error);
    showStatus(`Erreur: ${error.message}`, 'error');
  }
}

/**
 * Affiche un message de statut à l'utilisateur
 */
function showStatus(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);

  // Mettre à jour l'UI
  const statusEl = document.getElementById('status-message');
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.className = `status-${type}`;
  }
}

// ============================================================================
// Export des fonctions
// ============================================================================

export {
  makeDonation,
  trackDonation,
  getBalance,
  handleDonateButtonClick,
};

// ============================================================================
// Initialisation (si utilisé directement dans le HTML)
// ============================================================================

if (typeof window !== 'undefined') {
  window.CasperDonation = {
    makeDonation,
    trackDonation,
    getBalance,
    handleDonateButtonClick,
  };

  console.log('✅ Casper Donation API chargée');
  console.log('Utilisez window.CasperDonation.handleDonateButtonClick() pour tester');
}
