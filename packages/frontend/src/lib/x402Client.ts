import axios, { AxiosInstance } from 'axios';
import { 
  getWalletState, 
  sendTransaction, 
  waitForTransaction, 
  priceToWei, 
  PAYMENT_RECEIVER_ADDRESS,
  type WalletState,
  type TransactionResult 
} from './walletUtils';

export interface Agent {
  id: string;
  name: string;
  description: string;
  price: string;
  endpoint: string;
}

export interface PaymentFlow {
  status: 'idle' | 'requesting' | 'payment_required' | 'signing' | 'confirmed' | 'completed' | 'error' | 'wallet_check';
  message: string;
  paymentDetails?: {
    amount: string;
    currency: string;
    network: string;
    description: string;
  };
  result?: any;
  error?: string;
  transaction?: TransactionResult;
  walletState?: WalletState;
}

class X402Client {
  private client: AxiosInstance;

  constructor(backendUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') {
    this.client = axios.create({
      baseURL: backendUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getAgents(): Promise<Agent[]> {
    try {
      const response = await this.client.get('/api/info');
      return response.data.agents;
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      return [];
    }
  }

  async callAgent(
    agentId: string,
    params: Record<string, any>,
    onStatusChange?: (flow: PaymentFlow) => void,
    useRealPayment: boolean = true
  ): Promise<any> {
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
      let endpoint = '';
      let method: 'get' | 'post' = 'post';
      let data = params;

      // Determine endpoint and method based on agent
      switch (agentId) {
        case 'research':
          endpoint = `/agents/research?query=${encodeURIComponent(params.query)}`;
          method = 'get';
          data = {};
          break;
        case 'summary':
          endpoint = '/agents/summary';
          data = { text: params.text };
          break;
        case 'translate':
          endpoint = '/agents/translate';
          data = { text: params.text, targetLanguage: params.targetLanguage };
          break;
        case 'code-review':
          endpoint = '/agents/code-review';
          data = { code: params.code };
          break;
        default:
          throw new Error(`Unknown agent: ${agentId}`);
      }

      // First request - will get 402 Payment Required
      try {
        const response = await this.client({
          method,
          url: endpoint,
          data,
        });

        // If we get here, payment was somehow included (shouldn't happen in demo)
        flow.status = 'completed';
        flow.message = 'Service executed successfully!';
        flow.result = response.data;
        if (onStatusChange) onStatusChange(flow);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 402) {
          // Payment required
          const paymentInfo = error.response.data.payment;
          flow.status = 'payment_required';
          flow.message = `Payment required: ${paymentInfo.amount} ${paymentInfo.currency}`;
          flow.paymentDetails = paymentInfo;

          if (onStatusChange) onStatusChange(flow);

          let paymentHeader = 'mock-payment-signature'; // Fallback

          if (useRealPayment && walletState.address) {
            try {
              // Real payment flow
              flow.status = 'signing';
              flow.message = 'Please sign the transaction in your wallet...';
              if (onStatusChange) onStatusChange(flow);

              // Convert price to wei and send transaction
              const valueInWei = priceToWei(paymentInfo.amount);
              const transaction = await sendTransaction(
                PAYMENT_RECEIVER_ADDRESS,
                valueInWei,
                walletState.address
              );

              flow.transaction = transaction;
              flow.status = 'confirmed';
              flow.message = 'Transaction sent! Waiting for confirmation...';
              if (onStatusChange) onStatusChange(flow);

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
                
                flow.message = 'Payment confirmed! Processing request...';
              } else {
                throw new Error('Transaction confirmation failed');
              }
            } catch (paymentError: any) {
              console.error('Real payment failed, falling back to mock:', paymentError);
              
              // Fallback to mock payment
              flow.status = 'signing';
              flow.message = 'Real payment failed, using mock payment for demo...';
              if (onStatusChange) onStatusChange(flow);
              
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              flow.status = 'confirmed';
              flow.message = 'Mock payment confirmed! Processing request...';
              if (onStatusChange) onStatusChange(flow);
            }
          } else {
            // Mock payment flow (fallback)
            flow.status = 'signing';
            flow.message = 'Signing mock transaction...';
            if (onStatusChange) onStatusChange(flow);

            await new Promise(resolve => setTimeout(resolve, 1500));

            flow.status = 'confirmed';
            flow.message = 'Mock payment confirmed! Processing request...';
            if (onStatusChange) onStatusChange(flow);
          }

          // Retry request with payment header
          await new Promise(resolve => setTimeout(resolve, 1000));

          const retryResponse = await this.client({
            method,
            url: endpoint,
            data,
            headers: {
              'x-payment': paymentHeader,
            },
          });

          flow.status = 'completed';
          flow.message = 'Service executed successfully!';
          flow.result = retryResponse.data;
          if (onStatusChange) onStatusChange(flow);

          return retryResponse.data;
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      flow.status = 'error';
      flow.error = error.response?.data?.error || error.message || 'Unknown error';
      flow.message = `Error: ${flow.error}`;
      if (onStatusChange) onStatusChange(flow);
      throw error;
    }
  }
}

export default X402Client;
