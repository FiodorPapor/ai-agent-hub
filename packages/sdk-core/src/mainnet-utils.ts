/**
 * Mainnet-specific utilities for Universal Agent Wallet SDK
 */

import { NETWORK_CONFIGS, NETWORK_SPECIFIC_CONFIG } from './constants';

/**
 * Get current AVAX price from external API (for mainnet)
 */
export async function getCurrentAvaxPrice(): Promise<number> {
  try {
    // Using CoinGecko API as example
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd');
    const data = await response.json();
    return data['avalanche-2']?.usd || 50; // Fallback to $50
  } catch (error) {
    console.warn('[MainnetUtils] Failed to fetch AVAX price, using fallback');
    return 50; // Fallback price
  }
}

/**
 * Calculate dynamic USD to AVAX conversion rate
 */
export async function getDynamicConversionRate(network: string): Promise<number> {
  if (network === 'avalanche-mainnet') {
    return await getCurrentAvaxPrice();
  }
  
  // Use static rate for testnet
  const networkConfig = NETWORK_SPECIFIC_CONFIG[network as keyof typeof NETWORK_SPECIFIC_CONFIG];
  return networkConfig?.usdToAvaxRate || 1000;
}

/**
 * Validate mainnet configuration
 */
export function validateMainnetConfig(config: {
  privateKey?: string;
  walletAddress?: string;
  network?: string;
}): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  let isValid = true;

  if (config.network === 'avalanche-mainnet') {
    if (!config.privateKey) {
      warnings.push('Private key is required for mainnet operations');
      isValid = false;
    }

    if (!config.walletAddress) {
      warnings.push('Wallet address should be explicitly set for mainnet');
    }

    if (config.privateKey && config.privateKey.length !== 66) {
      warnings.push('Private key format appears invalid (should be 64 hex chars + 0x prefix)');
      isValid = false;
    }

    warnings.push('⚠️  MAINNET MODE: Real AVAX will be spent on transactions');
    warnings.push('💡 Ensure wallet has sufficient AVAX balance for gas fees');
  }

  return { isValid, warnings };
}

/**
 * Get recommended gas price for network
 */
export async function getRecommendedGasPrice(network: string): Promise<string> {
  const networkConfig = NETWORK_CONFIGS[network as keyof typeof NETWORK_CONFIGS];
  
  if (!networkConfig) {
    return '25000000000'; // 25 gwei fallback
  }

  try {
    // For mainnet, we could fetch dynamic gas prices
    if (network === 'avalanche-mainnet') {
      // Avalanche typically has low, stable gas prices
      return '25000000000'; // 25 gwei
    }
    
    // Testnet can use lower gas prices
    return '25000000000'; // 25 gwei
  } catch (error) {
    console.warn('[MainnetUtils] Failed to fetch gas price, using fallback');
    return '25000000000';
  }
}

/**
 * Estimate transaction cost in USD
 */
export async function estimateTransactionCostUSD(
  network: string,
  gasLimit: number = 21000
): Promise<number> {
  try {
    const gasPriceWei = await getRecommendedGasPrice(network);
    const gasPriceGwei = parseInt(gasPriceWei) / 1e9;
    const gasCostAvax = (gasPriceGwei * gasLimit) / 1e9;
    
    if (network === 'avalanche-mainnet') {
      const avaxPrice = await getCurrentAvaxPrice();
      return gasCostAvax * avaxPrice;
    }
    
    // For testnet, return nominal cost
    return 0.001;
  } catch (error) {
    console.warn('[MainnetUtils] Failed to estimate transaction cost');
    return 0.001;
  }
}

/**
 * Check if network is production (mainnet)
 */
export function isProductionNetwork(network: string): boolean {
  return network === 'avalanche-mainnet';
}

/**
 * Get network display name
 */
export function getNetworkDisplayName(network: string): string {
  const networkConfig = NETWORK_CONFIGS[network as keyof typeof NETWORK_CONFIGS];
  return networkConfig?.name || network;
}

/**
 * Get block explorer URL for transaction
 */
export function getTransactionUrl(network: string, txHash: string): string {
  const networkConfig = NETWORK_CONFIGS[network as keyof typeof NETWORK_CONFIGS];
  const baseUrl = networkConfig?.blockExplorer || 'https://snowtrace.io';
  return `${baseUrl}/tx/${txHash}`;
}
