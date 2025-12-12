/**
 * Payment service wrapper for AvalancheWallet
 * Provides validation and formatting utilities
 */

import { AvalancheWallet } from './avalanche-wallet';

/**
 * Send AVAX payment from one wallet to an address
 * @param fromWallet - Source AvalancheWallet instance
 * @param toAddress - Recipient address
 * @param amount - Amount in AVAX as string (e.g., "0.1")
 * @returns Transaction hash
 */
export async function pay(
  fromWallet: AvalancheWallet, 
  toAddress: string, 
  amount: string
): Promise<string> {
  // Validate inputs
  if (!fromWallet) {
    throw new Error('Source wallet is required');
  }

  if (!toAddress || typeof toAddress !== 'string') {
    throw new Error('Valid recipient address is required');
  }

  if (!amount || typeof amount !== 'string') {
    throw new Error('Valid amount is required');
  }

  // Validate amount format
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error('Amount must be a positive number');
  }

  // Format amount to ensure proper decimal places
  const formattedAmount = amountNum.toFixed(18).replace(/\.?0+$/, '');

  console.log(`Initiating payment: ${formattedAmount} AVAX from ${fromWallet.getAddress()} to ${toAddress}`);

  try {
    // Execute the payment
    const txHash = await fromWallet.sendNative(toAddress, formattedAmount);
    
    console.log(`Payment successful! Transaction hash: ${txHash}`);
    return txHash;
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
}

/**
 * Validate if an address is a valid Ethereum/Avalanche address
 * @param address - Address to validate
 * @returns Boolean indicating if address is valid
 */
export function isValidAddress(address: string): boolean {
  try {
    // Import ethers dynamically to avoid issues if not installed
    const { ethers } = require('ethers');
    return ethers.isAddress(address);
  } catch {
    // Fallback to regex if ethers is not available
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
}

/**
 * Format AVAX amount for display
 * @param amount - Amount in AVAX
 * @returns Formatted string
 */
export function formatAvaxAmount(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0 AVAX';
  
  return `${num.toFixed(6)} AVAX`;
}
