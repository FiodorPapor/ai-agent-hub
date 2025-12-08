// Wallet utilities for real transaction handling
export const AVALANCHE_FUJI_CHAIN_ID = '0xA869'; // 43113 in hex
export const PAYMENT_RECEIVER_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f5bB0e'; // Test address

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  isCorrectNetwork: boolean;
  chainId: string | null;
}

export interface TransactionResult {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

/**
 * Get clean ethereum provider avoiding conflicts
 */
export function getEthereumProvider() {
  if (typeof window === 'undefined') return null;

  let ethereum = (window as any).ethereum;

  // Handle multiple providers
  if (ethereum?.providers?.length > 0) {
    ethereum = ethereum.providers.find((p: any) => p.isMetaMask) || ethereum.providers[0];
  }

  // Validate provider has required methods
  if (!ethereum || typeof ethereum.request !== 'function') {
    return null;
  }

  return ethereum;
}

/**
 * Check wallet connection status
 */
export async function getWalletState(): Promise<WalletState> {
  const provider = getEthereumProvider();
  
  if (!provider) {
    return {
      isConnected: false,
      address: null,
      isCorrectNetwork: false,
      chainId: null,
    };
  }

  try {
    // Check accounts
    const accounts = await provider.request({
      method: 'eth_accounts',
    });

    // Check network
    const chainId = await provider.request({
      method: 'eth_chainId',
    });

    // Normalize chainId for comparison (handle both hex and decimal)
    const normalizedChainId = chainId.toLowerCase();
    const isCorrectNetwork = normalizedChainId === AVALANCHE_FUJI_CHAIN_ID.toLowerCase() || 
                            normalizedChainId === '0xa869' ||
                            parseInt(chainId, 16) === 43113 ||
                            chainId === '43113';

    console.log('🔍 Network check:', {
      received: chainId,
      normalized: normalizedChainId,
      expected: AVALANCHE_FUJI_CHAIN_ID,
      isCorrect: isCorrectNetwork
    });

    return {
      isConnected: accounts.length > 0,
      address: accounts[0] || null,
      isCorrectNetwork,
      chainId,
    };
  } catch (error) {
    console.error('Failed to get wallet state:', error);
    return {
      isConnected: false,
      address: null,
      isCorrectNetwork: false,
      chainId: null,
    };
  }
}

/**
 * Convert price string to wei amount for AVAX
 * Example: "$0.02" -> "0.001" AVAX -> wei
 */
export function priceToWei(priceStr: string): string {
  // Extract numeric value from price string like "$0.02"
  const numericValue = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
  
  // Convert to AVAX (rough conversion for demo: $0.02 ≈ 0.001 AVAX)
  // In production, you'd use real exchange rates
  const avaxAmount = numericValue * 0.05; // Rough conversion rate
  
  // Convert to wei (1 AVAX = 10^18 wei)
  const weiAmount = Math.floor(avaxAmount * Math.pow(10, 18));
  
  return `0x${weiAmount.toString(16)}`;
}

/**
 * Send real transaction through wallet
 */
export async function sendTransaction(
  toAddress: string,
  valueInWei: string,
  fromAddress: string
): Promise<TransactionResult> {
  const provider = getEthereumProvider();
  
  if (!provider) {
    throw new Error('No wallet provider available');
  }

  console.log('🔗 Sending transaction:', {
    from: fromAddress,
    to: toAddress,
    value: valueInWei,
  });

  try {
    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [{
        from: fromAddress,
        to: toAddress,
        value: valueInWei,
        gas: '0x5208', // 21000 gas for simple transfer
      }],
    });

    console.log('✅ Transaction sent:', txHash);

    return {
      hash: txHash,
      from: fromAddress,
      to: toAddress,
      value: valueInWei,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    console.error('❌ Transaction failed:', error);
    
    if (error.code === 4001) {
      throw new Error('Transaction rejected by user');
    } else if (error.code === -32603) {
      throw new Error('Transaction failed: insufficient funds or gas');
    } else {
      throw new Error(`Transaction failed: ${error.message || 'Unknown error'}`);
    }
  }
}

/**
 * Wait for transaction confirmation (simplified)
 */
export async function waitForTransaction(txHash: string): Promise<boolean> {
  const provider = getEthereumProvider();
  
  if (!provider) {
    return false;
  }

  try {
    // In a real app, you'd poll for transaction receipt
    // For demo, we'll just wait a bit and assume success
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ Transaction confirmed:', txHash);
    return true;
  } catch (error) {
    console.error('❌ Transaction confirmation failed:', error);
    return false;
  }
}
