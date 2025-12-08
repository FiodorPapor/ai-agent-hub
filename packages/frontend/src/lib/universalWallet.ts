import { 
  getWalletState, 
  sendTransaction, 
  waitForTransaction, 
  priceToWei, 
  PAYMENT_RECEIVER_ADDRESS,
  type WalletState,
  type TransactionResult 
} from './walletUtils';

export interface PaymentDetails {
  amount: string;
  currency: string;
  network: string;
  description: string;
  receiverAddress: string;
  facilitator?: string;
}

export interface PaymentFlow {
  status: 'idle' | 'requesting' | 'payment_required' | 'signing' | 'confirmed' | 'completed' | 'error' | 'wallet_check';
  message: string;
  paymentDetails?: PaymentDetails;
  result?: any;
  error?: string;
  transaction?: TransactionResult;
  walletState?: WalletState;
}

/**
 * Universal Wallet SDK for client-side applications (browser)
 * Provides seamless x402 micropayment capabilities for any API
 */
export class UniversalWallet {
  private backendUrl: string;

  constructor(backendUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3004') {
    this.backendUrl = backendUrl;
  }

  /**
   * Create a UniversalWallet instance
   */
  static connect(backendUrl?: string): UniversalWallet {
    return new UniversalWallet(backendUrl);
  }

  /**
   * Get current wallet address
   */
  async getAddress(): Promise<string> {
    const walletState = await getWalletState();
    return walletState.address || '';
  }

  /**
   * Get wallet balance in AVAX
   */
  async getBalance(): Promise<string> {
    const walletState = await getWalletState();
    return walletState.balance || '0.0';
  }

  /**
   * Main method - call a paid API with automatic payment handling
   */
  async callPaidAPI(
    url: string, 
    options: RequestInit = {},
    onStatusChange?: (flow: PaymentFlow) => void,
    useRealPayment: boolean = true
  ): Promise<Response> {
    const flow: PaymentFlow = {
      status: 'wallet_check',
      message: 'Checking wallet connection...',
    };

    if (onStatusChange) onStatusChange(flow);

    // Check wallet state first
    const walletState = await getWalletState();
    flow.walletState = walletState;

    if (!walletState.isConnected) {
      flow.status = 'error';
      flow.error = 'Wallet not connected';
      flow.message = 'Please connect your wallet first';
      if (onStatusChange) onStatusChange(flow);
      throw new Error('Wallet not connected');
    }

    if (!walletState.isCorrectNetwork) {
      flow.status = 'error';
      flow.error = 'Wrong network';
      flow.message = 'Please switch to Avalanche Fuji network';
      if (onStatusChange) onStatusChange(flow);
      throw new Error('Wrong network');
    }

    flow.status = 'requesting';
    flow.message = 'Requesting service...';
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
        const paymentInfo = await response.json();
        console.log('[UniversalWallet] Payment required:', paymentInfo);

        flow.status = 'payment_required';
        flow.message = `Payment required: ${paymentInfo.payment.amount} ${paymentInfo.payment.currency}`;
        flow.paymentDetails = paymentInfo.payment;

        if (onStatusChange) onStatusChange(flow);

        // Sign and send payment
        const paymentHeader = await this.signPayment(
          paymentInfo.payment, 
          flow, 
          onStatusChange, 
          useRealPayment
        );

        // Retry request with payment header
        await new Promise(resolve => setTimeout(resolve, 1000));

        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'x-payment': paymentHeader,
            ...options.headers
          }
        });

        flow.status = 'completed';
        flow.message = 'Service executed successfully!';
        if (onStatusChange) onStatusChange(flow);

        return retryResponse;
      }

      // No payment required
      flow.status = 'completed';
      flow.message = 'Service executed successfully!';
      if (onStatusChange) onStatusChange(flow);

      return response;
    } catch (error: any) {
      flow.status = 'error';
      flow.error = error.message || 'Unknown error';
      flow.message = `Error: ${flow.error}`;
      if (onStatusChange) onStatusChange(flow);
      throw error;
    }
  }

  /**
   * Send payment to specified address
   */
  async pay(to: string, amount: string): Promise<TransactionResult> {
    const walletState = await getWalletState();
    
    if (!walletState.isConnected || !walletState.address) {
      throw new Error('Wallet not connected');
    }

    const valueInWei = priceToWei(`$${parseFloat(amount) * 1000}`); // Convert AVAX to USD equivalent
    return await sendTransaction(to, valueInWei, walletState.address);
  }

  /**
   * Sign payment details for x402 header
   */
  async signPayment(
    paymentDetails: PaymentDetails,
    flow?: PaymentFlow,
    onStatusChange?: (flow: PaymentFlow) => void,
    useRealPayment: boolean = true
  ): Promise<string> {
    const walletState = await getWalletState();

    if (!walletState.isConnected || !walletState.address) {
      throw new Error('Wallet not connected');
    }

    let paymentHeader = 'mock-payment-signature'; // Fallback

    if (useRealPayment) {
      try {
        if (flow && onStatusChange) {
          flow.status = 'signing';
          flow.message = 'Please sign the transaction in your wallet...';
          onStatusChange(flow);
        }

        // Convert price to wei and send transaction
        const valueInWei = priceToWei(paymentDetails.amount);
        const transaction = await sendTransaction(
          paymentDetails.receiverAddress,
          valueInWei,
          walletState.address
        );

        if (flow) {
          flow.transaction = transaction;
          flow.status = 'confirmed';
          flow.message = 'Transaction sent! Waiting for confirmation...';
          if (onStatusChange) onStatusChange(flow);
        }

        // Wait for transaction confirmation
        const confirmed = await waitForTransaction(transaction.hash);
        
        if (confirmed) {
          paymentHeader = JSON.stringify({
            txHash: transaction.hash,
            from: transaction.from,
            to: transaction.to,
            value: transaction.value,
            timestamp: transaction.timestamp,
            network: 'avalanche-fuji'
          });
          
          if (flow) {
            flow.message = 'Payment confirmed! Processing request...';
            if (onStatusChange) onStatusChange(flow);
          }
        } else {
          throw new Error('Transaction confirmation failed');
        }
      } catch (paymentError: any) {
        console.error('[UniversalWallet] Real payment failed, falling back to mock:', paymentError);
        
        // Fallback to mock payment
        if (flow && onStatusChange) {
          flow.status = 'signing';
          flow.message = 'Real payment failed, using mock payment for demo...';
          onStatusChange(flow);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (flow && onStatusChange) {
          flow.status = 'confirmed';
          flow.message = 'Mock payment confirmed! Processing request...';
          onStatusChange(flow);
        }

        // Create mock payment
        paymentHeader = this.createMockPayment(paymentDetails, walletState.address);
      }
    } else {
      // Mock payment flow
      if (flow && onStatusChange) {
        flow.status = 'signing';
        flow.message = 'Signing mock transaction...';
        onStatusChange(flow);
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      if (flow && onStatusChange) {
        flow.status = 'confirmed';
        flow.message = 'Mock payment confirmed! Processing request...';
        onStatusChange(flow);
      }

      paymentHeader = this.createMockPayment(paymentDetails, walletState.address);
    }

    return paymentHeader;
  }

  /**
   * Create mock payment for demo purposes
   */
  private createMockPayment(paymentDetails: PaymentDetails, fromAddress: string): string {
    const mockTxHash = '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    return JSON.stringify({
      txHash: mockTxHash,
      from: fromAddress,
      to: paymentDetails.receiverAddress,
      value: paymentDetails.amount,
      timestamp: new Date().toISOString(),
      network: 'avalanche-fuji',
      mock: true
    });
  }

  /**
   * Get wallet connection state
   */
  async getWalletState(): Promise<WalletState> {
    return await getWalletState();
  }

  /**
   * Check if wallet can afford a payment
   */
  async canAfford(priceUSD: string): Promise<boolean> {
    try {
      const walletState = await getWalletState();
      if (!walletState.isConnected) return false;

      const balance = parseFloat(walletState.balance || '0');
      const priceInAVAX = parseFloat(priceUSD.replace('$', '')) / 1000; // Assuming $1000 = 1 AVAX
      
      // Add buffer for gas fees
      return balance >= (priceInAVAX + 0.001);
    } catch (error) {
      console.error('[UniversalWallet] Balance check failed:', error);
      return false;
    }
  }

  /**
   * Convenience method for calling the summarize API
   */
  async summarize(
    input: { url?: string; text?: string },
    onStatusChange?: (flow: PaymentFlow) => void,
    useRealPayment: boolean = true
  ): Promise<any> {
    const response = await this.callPaidAPI(
      `${this.backendUrl}/api/summarize`,
      {
        method: 'POST',
        body: JSON.stringify(input)
      },
      onStatusChange,
      useRealPayment
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Summarization failed');
    }

    return await response.json();
  }

  /**
   * Get service information
   */
  async getServiceInfo(): Promise<any> {
    const response = await fetch(`${this.backendUrl}/api/info`);
    return await response.json();
  }
}

export default UniversalWallet;
