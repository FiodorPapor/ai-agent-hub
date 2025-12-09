import { ethers } from "ethers";

// Avalanche Fuji Testnet configuration
const FUJI_RPC = "https://api.avax-test.network/ext/bc/C/rpc";
const FUJI_CHAIN_ID = 43113;

export interface PaymentResult {
  success: boolean;
  txHash?: string;
  error?: string;
  from?: string;
  to?: string;
  amount?: string;
}

export interface WalletStatus {
  isConfigured: boolean;
  address?: string;
  balance?: string;
  network: string;
  ready: boolean;
  error?: string;
}

/**
 * Universal Agent Wallet SDK for Telegram Bot
 * Handles x402 payments on Avalanche Fuji testnet
 */
export class UniversalWallet {
  private wallet: ethers.Wallet;
  private provider: ethers.JsonRpcProvider;
  private isValid: boolean = false;

  constructor(privateKey: string) {
    this.provider = new ethers.JsonRpcProvider(FUJI_RPC);
    
    try {
      // Validate and normalize private key format
      const normalizedKey = this.validateAndNormalizePrivateKey(privateKey);
      this.wallet = new ethers.Wallet(normalizedKey, this.provider);
      this.isValid = true;
    } catch (error: any) {
      console.error(`[Wallet] Initialization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validates and normalizes private key format
   * Accepts keys with or without 0x prefix
   */
  private validateAndNormalizePrivateKey(privateKey: string): string {
    if (!privateKey || typeof privateKey !== 'string') {
      throw new Error("Invalid private key format. Expected 64 hex characters");
    }

    // Remove whitespace and normalize
    const cleanKey = privateKey.trim();
    let normalizedKey = cleanKey;
    
    if (cleanKey.startsWith('0x')) {
      normalizedKey = cleanKey.slice(2);
    }

    // Validate hex format and length (64 characters)
    if (!/^[0-9a-fA-F]{64}$/.test(normalizedKey)) {
      throw new Error("Invalid private key format. Expected 64 hex characters");
    }

    return '0x' + normalizedKey;
  }

  /**
   * Get wallet address
   */
  getAddress(): string {
    return this.wallet.address;
  }

  /**
   * Get wallet balance in AVAX
   */
  async getBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }

  /**
   * Get comprehensive wallet status
   */
  async getWalletStatus(): Promise<WalletStatus> {
    try {
      if (!this.isValid) {
        return {
          isConfigured: false,
          network: "Avalanche Fuji",
          ready: false,
          error: "Wallet not properly configured"
        };
      }

      const balance = await this.getBalance();
      const balanceNum = parseFloat(balance);
      
      return {
        isConfigured: true,
        address: this.wallet.address,
        balance: balance,
        network: "Avalanche Fuji",
        ready: balanceNum > 0.001, // Need at least 0.001 AVAX for transactions
      };
    } catch (error: any) {
      return {
        isConfigured: false,
        network: "Avalanche Fuji",
        ready: false,
        error: error.message
      };
    }
  }

  /**
   * Check if wallet has sufficient balance for payment
   */
  async checkSufficientBalance(priceString: string): Promise<{ sufficient: boolean; required: string; available: string; message?: string }> {
    try {
      const required = this.parsePrice(priceString);
      const requiredAvax = ethers.formatEther(required);
      const availableBalance = await this.getBalance();
      const availableNum = parseFloat(availableBalance);
      const requiredNum = parseFloat(requiredAvax);

      const sufficient = availableNum >= requiredNum;

      if (!sufficient) {
        return {
          sufficient: false,
          required: requiredAvax,
          available: availableBalance,
          message: `Insufficient balance. Required: ${requiredAvax} AVAX, Available: ${availableBalance} AVAX. Get test AVAX: https://faucet.avax.network/`
        };
      }

      return {
        sufficient: true,
        required: requiredAvax,
        available: availableBalance
      };
    } catch (error: any) {
      return {
        sufficient: false,
        required: "unknown",
        available: "unknown",
        message: `Error checking balance: ${error.message}`
      };
    }
  }

  /**
   * Parse price from string like "$0.02" to wei
   * Assumes 1 AVAX ≈ $50 for testnet conversion
   */
  private parsePrice(priceString: string): bigint {
    const price = parseFloat(priceString.replace("$", ""));
    // Convert USD to AVAX (demo rate: $50/AVAX)
    const avaxAmount = price / 50;
    return ethers.parseEther(avaxAmount.toFixed(18));
  }

  /**
   * Execute payment transaction
   */
  async pay(to: string, priceString: string): Promise<PaymentResult> {
    try {
      // Check balance before attempting payment
      const balanceCheck = await this.checkSufficientBalance(priceString);
      if (!balanceCheck.sufficient) {
        return {
          success: false,
          error: balanceCheck.message || "Insufficient balance for payment"
        };
      }

      const value = this.parsePrice(priceString);
      
      console.log(`[Wallet] Sending ${ethers.formatEther(value)} AVAX to ${to}`);
      
      const tx = await this.wallet.sendTransaction({
        to: to,
        value: value,
        chainId: FUJI_CHAIN_ID,
      });

      console.log(`[Wallet] Transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait(1);
      
      if (!receipt) {
        throw new Error("Transaction failed: no receipt received");
      }

      console.log(`[Wallet] Transaction confirmed in block ${receipt.blockNumber}`);

      return {
        success: true,
        txHash: tx.hash,
        from: this.wallet.address,
        to: to,
        amount: priceString,
      };
    } catch (error: any) {
      console.error(`[Wallet] Payment error: ${error.message}`);
      
      // Provide helpful error messages
      let errorMessage = error.message;
      if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = "Insufficient balance for transaction including gas fees. Get test AVAX: https://faucet.avax.network/";
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = "Network error: Unable to connect to Avalanche Fuji network";
      } else if (error.message.includes('nonce')) {
        errorMessage = "Transaction nonce error: Please try again";
      }
      
      return {
        success: false,
        error: `Transaction failed: ${errorMessage}`,
      };
    }
  }

  /**
   * Create signed payment header for x402 protocol
   */
  async createPaymentHeader(paymentDetails: {
    amount: string;
    receiverAddress: string;
    description?: string;
  }): Promise<string> {
    // Execute real payment
    const paymentResult = await this.pay(
      paymentDetails.receiverAddress,
      paymentDetails.amount
    );

    if (!paymentResult.success) {
      throw new Error(`Payment failed: ${paymentResult.error}`);
    }

    // Return JSON with transaction data for x402 verification
    return JSON.stringify({
      txHash: paymentResult.txHash,
      from: paymentResult.from,
      to: paymentResult.to,
      amount: paymentResult.amount,
      network: "avalanche-fuji",
      chainId: FUJI_CHAIN_ID,
      timestamp: Date.now(),
    });
  }
}
