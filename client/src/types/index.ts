export interface StakeRecord {
  id: number;
  userAccountHash: string;
  actionType: 'stake' | 'unstake' | 'transfer';
  amount: string;
  stCsprAmount: string | null;
  recipientAccountHash: string | null;
  txHash: string;
  blockHeight: number;
  timestamp: string;
  publicKey?: string | null;
}

export interface Validator {
  id: number;
  publicKey: string;
  totalStaked: string;
  isActive: boolean;
  addedAt: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface ApiError {
  error: string;
  message?: string;
}

export interface AccountBalance {
  available: string; // CSPR balance
  staked: string; // User's total staked in contract
  stCspr: string; // stCSPR token balance
}
