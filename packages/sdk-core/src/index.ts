/**
 * Universal Agent Wallet SDK - Core Package
 * 
 * Provides x402 micropayment capabilities for AI agents and tools.
 * Built on Avalanche blockchain with seamless HTTP 402 Payment Required integration.
 */

export { UniversalWallet } from './UniversalWallet';
export { X402Client } from './X402Client';
export { x402Middleware, getTransactionLogs, getPaymentStatus } from './X402Middleware';

// Types
export type {
  PaymentDetails,
  PaymentFlow,
  TransactionResult,
  WalletConfig,
  X402Config,
  PaymentRequiredResponse
} from './types';

// Constants
export {
  AVALANCHE_FUJI_CHAIN_ID,
  AVALANCHE_MAINNET_CHAIN_ID,
  DEFAULT_PAYMENT_RECEIVER_ADDRESS
} from './constants';

// Utilities
export {
  priceToWei,
  formatPaymentAmount,
  validatePaymentDetails,
  createMockPayment,
  usdToAvax,
  isValidAddress
} from './utils';

// Mainnet utilities
export {
  getCurrentAvaxPrice,
  getDynamicConversionRate,
  validateMainnetConfig,
  getRecommendedGasPrice,
  estimateTransactionCostUSD,
  isProductionNetwork,
  getNetworkDisplayName,
  getTransactionUrl
} from './mainnet-utils';
