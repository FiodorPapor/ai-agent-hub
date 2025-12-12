/**
 * Demo Configuration
 */

// Default payment amount for the demo
export const DEFAULT_PAYMENT_AMOUNT = "0.001"; // AVAX

/**
 * Pretty-print AVAX values for display
 * @param amount - Amount in AVAX as string
 * @returns Formatted string
 */
export function formatAvaxDisplay(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0.000000 AVAX';
  
  return `${num.toFixed(6)} AVAX`;
}

/**
 * Create a visual separator for console output
 */
export function createSeparator(char: string = '=', length: number = 50): string {
  return char.repeat(length);
}

/**
 * Get Snowtrace explorer URL for a transaction
 * @param txHash - Transaction hash
 * @returns Snowtrace URL
 */
export function getExplorerUrl(txHash: string): string {
  return `https://testnet.snowtrace.io/tx/${txHash}`;
}
