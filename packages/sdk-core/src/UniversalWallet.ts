/**
 * Universal Wallet SDK for server-side applications
 * Provides payment capabilities for x402 micropayments on Avalanche
 */

import { ethers } from 'ethers';
import { 
  PaymentDetails, 
  TransactionResult, 
  WalletConfig, 
  PaymentFlow 
} from './types';
import { 
  AVALANCHE_FUJI_RPC, 
  AVALANCHE_MAINNET_RPC, 
  DEFAULT_GAS_LIMIT 
} from './constants';
import { 
  priceToWei, 
  createMockPayment, 
  usdToAvax 
} from './utils';

export class UniversalWallet {
  private wallet: ethers.Wallet | ethers.HDNodeWallet;
  private provider: ethers.JsonRpcProvider;
  private network: string;

  constructor(config: WalletConfig = {}) {
    // Default to Avalanche Fuji testnet
    this.network = config.network || 'avalanche-fuji';
    
    const rpcUrl = config.rpcUrl || 
      (this.network === 'avalanche-fuji' ? AVALANCHE_FUJI_RPC : AVALANCHE_MAINNET_RPC);

    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    if (config.privateKey) {
      this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    } else {
      // Generate random wallet for demo purposes
      const randomWallet = ethers.Wallet.createRandom();
      this.wallet = randomWallet.connect(this.provider);
      console.log(`[UniversalWallet] Generated demo wallet: ${this.wallet.address}`);
      // Note: Private key is NOT logged for security reasons
    }
  }

  /**
   * Create a UniversalWallet instance
   */
  static connect(privateKey?: string, config: Omit<WalletConfig, 'privateKey'> = {}): UniversalWallet {
    return new UniversalWallet({ ...config, privateKey });
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
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('[UniversalWallet] Failed to get balance:', error);
      return '0.0';
    }
  }

  /**
   * Main method - call a paid API with automatic payment handling
   */
  async callPaidAPI(
    url: string, 
    options: RequestInit = {},
    onStatusChange?: (flow: PaymentFlow) => void
  ): Promise<Response> {
    const flow: PaymentFlow = {
      status: 'requesting',
      message: 'Making initial request...'
    };

    if (onStatusChange) onStatusChange(flow);

    try {
      // First request - will likely get 402 Payment Required
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (response.status === 402) {
        // Payment required - handle automatically
        const paymentInfo: any = await response.json();
        console.log('[UniversalWallet] Payment required:', paymentInfo);

        flow.status = 'payment_required';
        flow.message = `Payment required: ${paymentInfo.payment.amount}`;
        flow.paymentDetails = paymentInfo.payment;
        if (onStatusChange) onStatusChange(flow);

        if (paymentInfo.payment) {
          // Sign and send payment
          const paymentHeader = await this.signPayment(paymentInfo.payment, flow, onStatusChange);
          
          // Retry request with payment header
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              'x-payment': paymentHeader,
              ...options.headers
            }
          });

          flow.status = 'completed';
          flow.message = 'Payment successful, service executed!';
          if (onStatusChange) onStatusChange(flow);

          return retryResponse;
        } else {
          throw new Error('Invalid payment response format');
        }
      }

      flow.status = 'completed';
      flow.message = 'Service executed successfully (no payment required)!';
      if (onStatusChange) onStatusChange(flow);

      return response;
    } catch (error: any) {
      flow.status = 'error';
      flow.error = error.message;
      flow.message = `Error: ${error.message}`;
      if (onStatusChange) onStatusChange(flow);
      
      console.error('[UniversalWallet] API call failed:', error);
      throw error;
    }
  }

  /**
   * Send payment to specified address
   */
  async pay(to: string, amount: string): Promise<TransactionResult> {
    try {
      console.log(`[UniversalWallet] Sending ${amount} AVAX to ${to}`);

      const tx = await this.wallet.sendTransaction({
        to,
        value: ethers.parseEther(amount),
        gasLimit: DEFAULT_GAS_LIMIT
      });

      console.log(`[UniversalWallet] Transaction sent: ${tx.hash}`);

      const result: TransactionResult = {
        hash: tx.hash,
        from: tx.from || this.wallet.address,
        to: tx.to || to,
        value: amount,
        timestamp: new Date().toISOString(),
        network: this.network
      };

      // Wait for confirmation
      try {
        const receipt = await tx.wait();
        result.confirmed = receipt?.status === 1;
        console.log(`[UniversalWallet] Transaction confirmed: ${tx.hash}`);
      } catch (confirmError) {
        console.warn(`[UniversalWallet] Transaction confirmation failed: ${confirmError}`);
        result.confirmed = false;
      }

      return result;
    } catch (error: any) {
      console.error('[UniversalWallet] Payment failed:', error);
      throw new Error(`Payment failed: ${error.message}`);
    }
  }

  /**
   * Sign payment details for x402 header
   */
  async signPayment(
    paymentDetails: PaymentDetails,
    flow?: PaymentFlow,
    onStatusChange?: (flow: PaymentFlow) => void
  ): Promise<string> {
    try {
      if (flow && onStatusChange) {
        flow.status = 'signing';
        flow.message = 'Processing payment...';
        onStatusChange(flow);
      }

      // Convert price to AVAX amount using network-specific rate
      const amountInAVAX = usdToAvax(paymentDetails.amount, this.network);

      console.log(`[UniversalWallet] Converting ${paymentDetails.amount} to ${amountInAVAX} AVAX`);

      // Send the actual transaction
      const transaction = await this.pay(paymentDetails.receiverAddress, amountInAVAX);

      if (flow && onStatusChange) {
        flow.status = 'confirmed';
        flow.message = 'Payment confirmed, processing request...';
        flow.transaction = transaction;
        onStatusChange(flow);
      }

      // Return transaction details as payment header
      return JSON.stringify({
        txHash: transaction.hash,
        from: transaction.from,
        to: transaction.to,
        value: transaction.value,
        timestamp: transaction.timestamp,
        network: this.network
      });
    } catch (error: any) {
      console.error('[UniversalWallet] Payment signing failed:', error);
      
      // Fallback to mock payment for demo
      console.log('[UniversalWallet] Falling back to mock payment');
      return createMockPayment(paymentDetails, this.wallet.address);
    }
  }

  /**
   * Get network information
   */
  getNetwork(): string {
    return this.network;
  }

  /**
   * Check if wallet has sufficient balance for payment
   */
  async canAfford(amountInAVAX: string): Promise<boolean> {
    try {
      const balance = await this.getBalance();
      const required = parseFloat(amountInAVAX);
      const available = parseFloat(balance);
      
      // Add some buffer for gas fees
      return available >= (required + 0.001);
    } catch (error) {
      console.error('[UniversalWallet] Balance check failed:', error);
      return false;
    }
  }

  /**
   * Estimate gas cost for a transaction
   */
  async estimateGasCost(to: string, amount: string): Promise<string> {
    try {
      const gasPrice = await this.provider.getFeeData();
      const gasLimit = DEFAULT_GAS_LIMIT;
      
      if (gasPrice.gasPrice) {
        const gasCost = gasPrice.gasPrice * BigInt(gasLimit);
        return ethers.formatEther(gasCost);
      }
      
      return '0.001'; // Fallback estimate
    } catch (error) {
      console.error('[UniversalWallet] Gas estimation failed:', error);
      return '0.001';
    }
  }
}
