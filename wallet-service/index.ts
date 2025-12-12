/**
 * Wallet Service - Clean Avalanche Fuji wallet implementation
 * Entry point for all wallet-related functionality
 */

// Export the main wallet class
export { AvalancheWallet } from './avalanche-wallet';

// Export payment utilities
export { pay, isValidAddress, formatAvaxAmount } from './payment-service';

// Export constants
export {
  AVALANCHE_FUJI_RPC,
  AVALANCHE_FUJI_CHAIN_ID,
  AVALANCHE_FUJI_EXPLORER,
  DEFAULT_GAS_LIMIT
} from './constants';

// Re-export for convenience
export * from './avalanche-wallet';
export * from './payment-service';
export * from './constants';
