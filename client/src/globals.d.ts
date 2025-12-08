// Global TypeScript declarations for StakeVue

export {};

declare global {
  interface Window {
    // Runtime configuration from public/config.js
    config: {
      contract_hash: string;
      contract_hash_v5?: string; // V5.0 backup contract
      contract_package_hash: string;
      use_real_transfers?: boolean; // V6.1: Enable real CSPR transfers
      cspr_click_app_name: string;
      cspr_click_app_id: string;
      cspr_click_providers: string[];
      chain_name: string;
      api_url: string;
      cspr_live_url: string;
      transaction_payment: string;
      min_stake_amount: string;
    };

    // CSPR.click global object
    csprclick?: {
      signIn: () => void;
      signOut: () => void;
      switchAccount: () => void;
      disconnect: (provider?: string) => void;
      send: (
        transaction: { Version1: object } | { deploy: object },
        senderPublicKey: string,
        onStatusUpdate?: (status: string, data: any) => void
      ) => Promise<any>;
      chainName?: string;
    };
  }
}
