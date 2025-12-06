import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'fr';

interface Translations {
  [key: string]: string;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.stake': 'Stake',
    'nav.guide': 'Guide',
    'nav.connect': 'Connect Wallet',
    'nav.connected': 'Connected',

    // Home Page
    'home.title': 'StakeVue',
    'home.subtitle': 'The liquid staking protocol on Casper Network. Stake CSPR, receive stCSPR tokens, and earn ~17% APY while keeping full liquidity.',
    'home.startStaking': 'Start Staking',
    'home.learnMore': 'Learn More',
    'home.apyRewards': 'APY Rewards',
    'home.instant': 'Instant',
    'home.stcsprMinting': 'stCSPR Minting',
    'home.noLock': 'No Lock',
    'home.unstakeAnytime': 'Unstake Anytime',
    'home.audited': 'Audited',
    'home.smartContract': 'Smart Contract',
    'home.howItWorks': 'How Does It Work?',
    'home.threeSteps': 'Three simple steps to start earning rewards',
    'home.connectWallet': 'Connect Wallet',
    'home.connectWalletDesc': 'Connect your Casper wallet via CSPR.click. Compatible with Casper Wallet, Ledger, and more.',
    'home.stakeCspr': 'Stake CSPR',
    'home.stakeCsprDesc': 'Deposit any amount of CSPR. Instantly receive stCSPR tokens at 1:1 ratio.',
    'home.earnRewards': 'Earn Rewards',
    'home.earnRewardsDesc': 'Your CSPR earns ~17% APY. Use your stCSPR freely in DeFi or unstake anytime.',
    'home.realExample': 'Real Example',
    'home.whyStakevue': 'Why StakeVue?',
    'home.bestExperience': 'The best liquid staking experience on Casper',
    'home.fullLiquidity': 'Full Liquidity',
    'home.fullLiquidityDesc': 'Your stCSPR tokens are fully liquid. Trade, transfer, or use in DeFi while earning staking rewards.',
    'home.apyReturns': '~17% APY Returns',
    'home.apyReturnsDesc': 'Earn automatic staking rewards without any effort. Watch your balance grow over time.',
    'home.secureAudited': 'Secure & Audited',
    'home.secureAuditedDesc': 'Smart contract audited for security. Your funds are protected by multi-validator distribution.',
    'home.multiValidator': 'Multi-Validator',
    'home.multiValidatorDesc': 'Your stake is distributed across top validators for better decentralization and security.',
    'home.readyToStart': 'Ready to Start Earning?',
    'home.joinThousands': 'Join thousands of stakers earning passive income on Casper Network',

    // Stake Page
    'stake.title': 'Stake & Unstake',
    'stake.subtitle': 'Manage your staked CSPR and stCSPR tokens',
    'stake.demoNotice': 'Demo Mode: This version uses a demonstration contract. Transactions are recorded on the blockchain, but CSPR is not actually transferred. This is a safe test environment.',
    'stake.stake': 'Stake',
    'stake.unstake': 'Unstake',
    'stake.amount': 'Amount',
    'stake.balance': 'Balance',
    'stake.max': 'MAX',
    'stake.youWillReceive': 'You will receive',
    'stake.exchangeRate': 'Exchange Rate',
    'stake.apy': 'APY (estimated)',
    'stake.gasFee': 'Gas Fee',
    'stake.minStake': 'Min. Stake',
    'stake.confirmStake': 'Confirm Stake',
    'stake.confirmUnstake': 'Confirm Unstake',
    'stake.processing': 'Processing...',

    // Dashboard
    'dashboard.portfolio': 'Portfolio Overview',
    'dashboard.totalBalance': 'Total Balance',
    'dashboard.csprBalance': 'CSPR Balance',
    'dashboard.stcsprBalance': 'stCSPR Balance',
    'dashboard.yearlyRewards': 'Est. Yearly Rewards',
    'dashboard.csprPrice': 'CSPR Price',
    'dashboard.stakingApy': 'Staking APY',

    // Leaderboard
    'leaderboard.title': 'Top Stakers',
    'leaderboard.rank': 'Rank',
    'leaderboard.address': 'Address',
    'leaderboard.staked': 'Staked',
    'leaderboard.rewards': 'Rewards',
    'leaderboard.totalStaked': 'Total Staked',
    'leaderboard.refresh': 'Refresh',

    // Validators
    'validators.title': 'Validator Ranking',
    'validators.name': 'Validator',
    'validators.stake': 'Total Stake',
    'validators.delegators': 'Delegators',
    'validators.commission': 'Commission',
    'validators.apy': 'APY',
    'validators.select': 'Select',

    // Calculator
    'calculator.title': 'Staking Calculator',
    'calculator.amount': 'Stake Amount (CSPR)',
    'calculator.period': 'Staking Period',
    'calculator.months': 'months',
    'calculator.estimatedEarnings': 'Estimated Earnings',
    'calculator.totalValue': 'Total Value',
    'calculator.monthlyRewards': 'Monthly Rewards',
    'calculator.disclaimer': 'These are estimates based on current APY rates (15-18%). Actual returns may vary.',

    // Price Alert
    'priceAlert.title': 'Price Alerts',
    'priceAlert.setAlert': 'Set Alert',
    'priceAlert.above': 'Price goes above',
    'priceAlert.below': 'Price goes below',
    'priceAlert.targetPrice': 'Target Price (USD)',
    'priceAlert.createAlert': 'Create Alert',
    'priceAlert.activeAlerts': 'Active Alerts',
    'priceAlert.noAlerts': 'No active alerts',

    // Guide Page
    'guide.title': 'Master Liquid Staking',
    'guide.subtitle': 'Learn how to earn passive income on your CSPR while keeping full liquidity. No lock-ups, no complexity - just rewards.',
    'guide.startNow': 'Start Staking Now',
    'guide.traditionalVsLiquid': 'Traditional vs Liquid Staking',
    'guide.traditional': 'Traditional Staking',
    'guide.liquid': 'Liquid Staking',
    'guide.tokensLocked': 'Tokens locked',
    'guide.stayLiquid': 'Stay liquid with stCSPR',
    'guide.stepByStep': 'Step-by-Step Tutorial',
    'guide.faq': 'Frequently Asked Questions',

    // Global Stats
    'stats.title': 'Protocol Statistics',
    'stats.tvl': 'Total Value Locked',
    'stats.stakers': 'Active Stakers',
    'stats.avgApy': 'Average APY',
    'stats.rewardsPaid': 'Total Rewards Paid',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.copy': 'Copy',
    'common.copied': 'Copied!',
    'common.year': 'year',
    'common.month': 'month',
    'common.day': 'day',
    'common.live': 'LIVE',
    'common.demo': 'DEMO',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.stake': 'Staker',
    'nav.guide': 'Guide',
    'nav.connect': 'Connecter Wallet',
    'nav.connected': 'Connecté',

    // Home Page
    'home.title': 'StakeVue',
    'home.subtitle': 'Le protocole de liquid staking sur Casper Network. Stakez vos CSPR, recevez des tokens stCSPR et gagnez ~17% APY tout en gardant votre liquidité.',
    'home.startStaking': 'Commencer à Staker',
    'home.learnMore': 'En Savoir Plus',
    'home.apyRewards': 'Rendement APY',
    'home.instant': 'Instantané',
    'home.stcsprMinting': 'Création stCSPR',
    'home.noLock': 'Sans Verrouillage',
    'home.unstakeAnytime': 'Unstake à Tout Moment',
    'home.audited': 'Audité',
    'home.smartContract': 'Smart Contract',
    'home.howItWorks': 'Comment Ça Marche ?',
    'home.threeSteps': 'Trois étapes simples pour commencer à gagner des récompenses',
    'home.connectWallet': 'Connecter le Wallet',
    'home.connectWalletDesc': 'Connectez votre wallet Casper via CSPR.click. Compatible avec Casper Wallet, Ledger, et plus.',
    'home.stakeCspr': 'Staker CSPR',
    'home.stakeCsprDesc': 'Déposez n\'importe quel montant de CSPR. Recevez instantanément des tokens stCSPR au ratio 1:1.',
    'home.earnRewards': 'Gagner des Récompenses',
    'home.earnRewarnsDesc': 'Vos CSPR gagnent ~17% APY. Utilisez vos stCSPR librement en DeFi ou unstakez à tout moment.',
    'home.realExample': 'Exemple Réel',
    'home.whyStakevue': 'Pourquoi StakeVue ?',
    'home.bestExperience': 'La meilleure expérience de liquid staking sur Casper',
    'home.fullLiquidity': 'Liquidité Totale',
    'home.fullLiquidityDesc': 'Vos tokens stCSPR sont totalement liquides. Tradez, transférez ou utilisez en DeFi tout en gagnant des récompenses.',
    'home.apyReturns': '~17% de Rendement APY',
    'home.apyReturnsDesc': 'Gagnez des récompenses de staking automatiquement. Regardez votre solde augmenter.',
    'home.secureAudited': 'Sécurisé & Audité',
    'home.secureAuditedDesc': 'Smart contract audité pour la sécurité. Vos fonds sont protégés par une distribution multi-validateurs.',
    'home.multiValidator': 'Multi-Validateurs',
    'home.multiValidatorDesc': 'Votre stake est distribué sur les meilleurs validateurs pour une meilleure décentralisation.',
    'home.readyToStart': 'Prêt à Commencer ?',
    'home.joinThousands': 'Rejoignez des milliers de stakers qui gagnent des revenus passifs sur Casper Network',

    // Stake Page
    'stake.title': 'Staker & Unstaker',
    'stake.subtitle': 'Gérez vos CSPR stakés et vos tokens stCSPR',
    'stake.demoNotice': 'Mode Démo : Cette version utilise un contrat de démonstration. Les transactions sont enregistrées sur la blockchain, mais les CSPR ne sont pas réellement transférés. C\'est un environnement de test sûr.',
    'stake.stake': 'Staker',
    'stake.unstake': 'Unstaker',
    'stake.amount': 'Montant',
    'stake.balance': 'Solde',
    'stake.max': 'MAX',
    'stake.youWillReceive': 'Vous recevrez',
    'stake.exchangeRate': 'Taux de Change',
    'stake.apy': 'APY (estimé)',
    'stake.gasFee': 'Frais de Gas',
    'stake.minStake': 'Stake Min.',
    'stake.confirmStake': 'Confirmer le Stake',
    'stake.confirmUnstake': 'Confirmer l\'Unstake',
    'stake.processing': 'Traitement...',

    // Dashboard
    'dashboard.portfolio': 'Aperçu du Portefeuille',
    'dashboard.totalBalance': 'Solde Total',
    'dashboard.csprBalance': 'Solde CSPR',
    'dashboard.stcsprBalance': 'Solde stCSPR',
    'dashboard.yearlyRewards': 'Récompenses Annuelles Est.',
    'dashboard.csprPrice': 'Prix CSPR',
    'dashboard.stakingApy': 'APY de Staking',

    // Leaderboard
    'leaderboard.title': 'Top des Stakers',
    'leaderboard.rank': 'Rang',
    'leaderboard.address': 'Adresse',
    'leaderboard.staked': 'Staké',
    'leaderboard.rewards': 'Récompenses',
    'leaderboard.totalStaked': 'Total Staké',
    'leaderboard.refresh': 'Actualiser',

    // Validators
    'validators.title': 'Classement des Validateurs',
    'validators.name': 'Validateur',
    'validators.stake': 'Stake Total',
    'validators.delegators': 'Délégateurs',
    'validators.commission': 'Commission',
    'validators.apy': 'APY',
    'validators.select': 'Sélectionner',

    // Calculator
    'calculator.title': 'Calculateur de Staking',
    'calculator.amount': 'Montant à Staker (CSPR)',
    'calculator.period': 'Période de Staking',
    'calculator.months': 'mois',
    'calculator.estimatedEarnings': 'Gains Estimés',
    'calculator.totalValue': 'Valeur Totale',
    'calculator.monthlyRewards': 'Récompenses Mensuelles',
    'calculator.disclaimer': 'Ces estimations sont basées sur les taux APY actuels (15-18%). Les rendements réels peuvent varier.',

    // Price Alert
    'priceAlert.title': 'Alertes de Prix',
    'priceAlert.setAlert': 'Définir une Alerte',
    'priceAlert.above': 'Le prix dépasse',
    'priceAlert.below': 'Le prix descend sous',
    'priceAlert.targetPrice': 'Prix Cible (USD)',
    'priceAlert.createAlert': 'Créer l\'Alerte',
    'priceAlert.activeAlerts': 'Alertes Actives',
    'priceAlert.noAlerts': 'Aucune alerte active',

    // Guide Page
    'guide.title': 'Maîtrisez le Liquid Staking',
    'guide.subtitle': 'Apprenez à gagner des revenus passifs sur vos CSPR tout en gardant une liquidité totale. Pas de verrouillage, pas de complexité - juste des récompenses.',
    'guide.startNow': 'Commencer à Staker',
    'guide.traditionalVsLiquid': 'Staking Traditionnel vs Liquide',
    'guide.traditional': 'Staking Traditionnel',
    'guide.liquid': 'Liquid Staking',
    'guide.tokensLocked': 'Tokens verrouillés',
    'guide.stayLiquid': 'Restez liquide avec stCSPR',
    'guide.stepByStep': 'Tutoriel Étape par Étape',
    'guide.faq': 'Questions Fréquentes',

    // Global Stats
    'stats.title': 'Statistiques du Protocole',
    'stats.tvl': 'Valeur Totale Verrouillée',
    'stats.stakers': 'Stakers Actifs',
    'stats.avgApy': 'APY Moyen',
    'stats.rewardsPaid': 'Récompenses Distribuées',

    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.confirm': 'Confirmer',
    'common.close': 'Fermer',
    'common.save': 'Sauvegarder',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'common.copy': 'Copier',
    'common.copied': 'Copié !',
    'common.year': 'an',
    'common.month': 'mois',
    'common.day': 'jour',
    'common.live': 'LIVE',
    'common.demo': 'DÉMO',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('stakevue-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('stakevue-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
