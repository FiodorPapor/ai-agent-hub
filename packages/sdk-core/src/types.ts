/**
 * Type definitions for Universal Agent Wallet SDK
 */

export interface PaymentDetails {
  amount: string;
  currency: string;
  network: string;
  description: string;
  receiverAddress: string;
  facilitator?: string;
}

export interface TransactionResult {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
  network: string;
  confirmed?: boolean;
}

export interface WalletConfig {
  privateKey?: string;
  rpcUrl?: string;
  network?: string;
}

export interface X402Config {
  facilitatorUrl: string;
  walletAddress: string;
  enableRealVerification?: boolean;
}

export interface PaymentFlow {
  status: 'idle' | 'requesting' | 'payment_required' | 'signing' | 'confirmed' | 'completed' | 'error' | 'wallet_check';
  message: string;
  paymentDetails?: PaymentDetails;
  result?: any;
  error?: string;
  transaction?: TransactionResult;
}

export interface PaymentRequiredResponse {
  status: 'payment_required';
  message: string;
  payment: PaymentDetails;
  instruction?: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  isCorrectNetwork: boolean;
  chainId: string | null;
  balance?: string;
}

export interface PaymentConfig {
  price: string;
  network: string;
  description: string;
}
