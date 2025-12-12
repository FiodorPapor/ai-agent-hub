/**
 * Constants for Universal Agent Wallet SDK
 */

// Avalanche Network Chain IDs
export const AVALANCHE_FUJI_CHAIN_ID = '0xA869'; // 43113 in hex
export const AVALANCHE_MAINNET_CHAIN_ID = '0xA86A'; // 43114 in hex

// Default RPC URLs
export const AVALANCHE_FUJI_RPC = 'https://api.avax-test.network/ext/bc/C/rpc';
export const AVALANCHE_MAINNET_RPC = 'https://api.avax.network/ext/bc/C/rpc';

// Default payment receiver addresses
export const DEFAULT_PAYMENT_RECEIVER_ADDRESS_TESTNET = '0x742d35Cc6634C0532925a3b844Bc9e7595f5bB0e';
export const DEFAULT_PAYMENT_RECEIVER_ADDRESS_MAINNET = '0x742d35Cc6634C0532925a3b844Bc9e7595f5bB0e'; // TODO: Replace with production address

// Backward compatibility
export const DEFAULT_PAYMENT_RECEIVER_ADDRESS = DEFAULT_PAYMENT_RECEIVER_ADDRESS_TESTNET;

// Network configurations
export const NETWORK_CONFIGS = {
  'avalanche-fuji': {
    chainId: AVALANCHE_FUJI_CHAIN_ID,
    rpcUrl: AVALANCHE_FUJI_RPC,
    name: 'Avalanche Fuji Testnet',
    currency: 'AVAX',
    blockExplorer: 'https://testnet.snowtrace.io'
  },
  'avalanche-mainnet': {
    chainId: AVALANCHE_MAINNET_CHAIN_ID,
    rpcUrl: AVALANCHE_MAINNET_RPC,
    name: 'Avalanche Mainnet',
    currency: 'AVAX',
    blockExplorer: 'https://snowtrace.io'
  }
} as const;

// Default gas limits
export const DEFAULT_GAS_LIMIT = 21000;
export const DEFAULT_GAS_BUFFER = 0.001; // AVAX

// Payment conversion rates
export const USD_TO_AVAX_RATE_TESTNET = 1000; // $1000 = 1 AVAX (demo rate for testnet)
export const USD_TO_AVAX_RATE_MAINNET = 50; // $50 = 1 AVAX (approximate mainnet rate)

// Network-specific configurations
export const NETWORK_SPECIFIC_CONFIG = {
  'avalanche-fuji': {
    usdToAvaxRate: USD_TO_AVAX_RATE_TESTNET,
    receiverAddress: DEFAULT_PAYMENT_RECEIVER_ADDRESS_TESTNET,
    isTestnet: true
  },
  'avalanche-mainnet': {
    usdToAvaxRate: USD_TO_AVAX_RATE_MAINNET,
    receiverAddress: DEFAULT_PAYMENT_RECEIVER_ADDRESS_MAINNET,
    isTestnet: false
  }
} as const;
