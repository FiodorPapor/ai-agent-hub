/**
 * X402 Client for handling HTTP 402 Payment Required responses
 * Works with any x402-compatible API endpoint
 */

import { PaymentFlow, PaymentDetails } from './types';
import { UniversalWallet } from './UniversalWallet';

export interface X402ClientConfig {
  wallet?: UniversalWallet;
  baseURL?: string;
  defaultHeaders?: Record<string, string>;
}

export class X402Client {
  private wallet?: UniversalWallet;
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(config: X402ClientConfig = {}) {
    this.wallet = config.wallet;
    this.baseURL = config.baseURL || '';
    this.defaultHeaders = config.defaultHeaders || {
      'Content-Type': 'application/json'
    };
  }

  /**
   * Set the wallet for payments
   */
  setWallet(wallet: UniversalWallet): void {
    this.wallet = wallet;
  }

  /**
   * Make a request to an x402-enabled endpoint
   */
  async request(
    url: string,
    options: RequestInit = {},
    onStatusChange?: (flow: PaymentFlow) => void
  ): Promise<Response> {
    if (!this.wallet) {
      throw new Error('Wallet not configured. Use setWallet() or provide wallet in constructor.');
    }

    const fullUrl = this.baseURL ? `${this.baseURL}${url}` : url;
    
    return this.wallet.callPaidAPI(fullUrl, {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      }
    }, onStatusChange);
  }

  /**
   * GET request with x402 support
   */
  async get(
    url: string,
    onStatusChange?: (flow: PaymentFlow) => void
  ): Promise<Response> {
    return this.request(url, { method: 'GET' }, onStatusChange);
  }

  /**
   * POST request with x402 support
   */
  async post(
    url: string,
    data?: any,
    onStatusChange?: (flow: PaymentFlow) => void
  ): Promise<Response> {
    return this.request(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    }, onStatusChange);
  }

  /**
   * PUT request with x402 support
   */
  async put(
    url: string,
    data?: any,
    onStatusChange?: (flow: PaymentFlow) => void
  ): Promise<Response> {
    return this.request(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    }, onStatusChange);
  }

  /**
   * DELETE request with x402 support
   */
  async delete(
    url: string,
    onStatusChange?: (flow: PaymentFlow) => void
  ): Promise<Response> {
    return this.request(url, { method: 'DELETE' }, onStatusChange);
  }

  /**
   * Check if an endpoint requires payment (dry run)
   */
  async checkPaymentRequired(url: string): Promise<PaymentDetails | null> {
    const fullUrl = this.baseURL ? `${this.baseURL}${url}` : url;
    
    try {
      const response = await fetch(fullUrl, {
        method: 'HEAD',
        headers: this.defaultHeaders
      });

      if (response.status === 402) {
        const paymentInfo = await response.json();
        return paymentInfo.payment || null;
      }

      return null;
    } catch (error) {
      console.error('[X402Client] Failed to check payment requirements:', error);
      return null;
    }
  }
}
