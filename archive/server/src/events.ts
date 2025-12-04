// Event types from the smart contract

export interface ContractEvent {
  contract_package_hash: string;
  event_type: string;
  event_data: any;
  block_height: number;
  timestamp: string;
  deploy_hash: string;
}

export interface StakeEvent {
  user: string; // Account hash
  amount: string; // Amount in motes
  st_cspr_amount: string; // stCSPR tokens minted
}

export interface UnstakeEvent {
  user: string;
  amount: string;
  st_cspr_amount: string; // stCSPR tokens burned
}

export interface TransferEvent {
  from: string;
  to: string;
  amount: string; // stCSPR amount transferred
}

export interface ValidatorAddedEvent {
  validator: string; // Validator public key
  admin: string;
}

export interface ValidatorRemovedEvent {
  validator: string;
  admin: string;
}

// WebSocket message types
export interface PingMessage {
  type: 'ping';
  timestamp: number;
}

export interface ContractEventMessage {
  type: 'contract_event';
  data: ContractEvent;
}

export type WebSocketMessage = PingMessage | ContractEventMessage;
