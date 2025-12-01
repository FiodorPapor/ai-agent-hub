import axios, { AxiosInstance } from 'axios';

export interface Agent {
  id: string;
  name: string;
  description: string;
  price: string;
  endpoint: string;
}

export interface PaymentFlow {
  status: 'idle' | 'requesting' | 'payment_required' | 'signing' | 'confirmed' | 'completed' | 'error';
  message: string;
  paymentDetails?: {
    amount: string;
    currency: string;
    network: string;
    description: string;
  };
  result?: any;
  error?: string;
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
    onStatusChange?: (flow: PaymentFlow) => void
  ): Promise<any> {
    const flow: PaymentFlow = {
      status: 'requesting',
      message: 'Requesting service...',
    };

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

          // Simulate payment signing
          flow.status = 'signing';
          flow.message = 'Signing transaction...';
          if (onStatusChange) onStatusChange(flow);

          // Simulate payment delay
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Simulate payment confirmation
          flow.status = 'confirmed';
          flow.message = 'Payment confirmed! Processing request...';
          if (onStatusChange) onStatusChange(flow);

          // Retry with mock payment header
          await new Promise(resolve => setTimeout(resolve, 1000));

          const retryResponse = await this.client({
            method,
            url: endpoint,
            data,
            headers: {
              'x-payment': 'mock-payment-signature',
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
