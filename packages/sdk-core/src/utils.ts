/**
 * Utility functions for Universal Agent Wallet SDK
 */

import { PaymentDetails } from './types';
import { NETWORK_SPECIFIC_CONFIG, USD_TO_AVAX_RATE_TESTNET } from './constants';

/**
 * Convert price string to wei amount for AVAX
 * Example: "$0.02" -> "0.001" AVAX -> wei
 */
export function priceToWei(priceStr: string, network: string = 'avalanche-fuji'): string {
  // Extract numeric value from price string like "$0.02"
  const numericValue = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
  
  // Get network-specific conversion rate
  const networkConfig = NETWORK_SPECIFIC_CONFIG[network as keyof typeof NETWORK_SPECIFIC_CONFIG];
  const conversionRate = networkConfig?.usdToAvaxRate || USD_TO_AVAX_RATE_TESTNET;
  
  // Convert to AVAX
  const avaxAmount = numericValue / conversionRate;
  
  // Convert to wei (1 AVAX = 10^18 wei)
  const weiAmount = Math.floor(avaxAmount * Math.pow(10, 18));
  
  return `0x${weiAmount.toString(16)}`;
}

/**
 * Format payment amount for display
 */
export function formatPaymentAmount(amount: string, currency: string = 'AVAX'): string {
  const numericAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
  return `${numericAmount.toFixed(6)} ${currency}`;
}

/**
 * Validate payment details structure
 */
export function validatePaymentDetails(details: PaymentDetails): boolean {
  const required = ['amount', 'currency', 'network', 'receiverAddress'];
  return required.every(field => details[field as keyof PaymentDetails]);
}

/**
 * Create mock payment for testing purposes
 */
export function createMockPayment(paymentDetails: PaymentDetails, fromAddress: string): string {
  const mockTxHash = '0x' + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');

  return JSON.stringify({
    txHash: mockTxHash,
    from: fromAddress,
    to: paymentDetails.receiverAddress,
    value: paymentDetails.amount,
    timestamp: new Date().toISOString(),
    network: paymentDetails.network,
    mock: true
  });
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if address is valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Convert USD price to AVAX amount
 */
export function usdToAvax(usdAmount: string, network: string = 'avalanche-fuji'): string {
  const numericAmount = parseFloat(usdAmount.replace(/[^0-9.]/g, ''));
  
  // Get network-specific conversion rate
  const networkConfig = NETWORK_SPECIFIC_CONFIG[network as keyof typeof NETWORK_SPECIFIC_CONFIG];
  const conversionRate = networkConfig?.usdToAvaxRate || USD_TO_AVAX_RATE_TESTNET;
  
  return (numericAmount / conversionRate).toString();
}
