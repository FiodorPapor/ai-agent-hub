/**
 * Agent A - Payment sender agent
 */

import { Agent } from '../shared/types';
import { AvalancheWallet } from '../../wallet-service';
import { createAgentAWallet } from './wallet';

export class AgentA implements Agent {
  private wallet: AvalancheWallet;
  private readonly name = 'Agent A';

  constructor(wallet?: AvalancheWallet) {
    this.wallet = wallet || createAgentAWallet();
  }

  /**
   * Get agent name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get agent's wallet address
   */
  async getAddress(): Promise<string> {
    return this.wallet.getAddress();
  }

  /**
   * Get agent's balance in AVAX
   */
  async getBalance(): Promise<string> {
    try {
      const balance = await this.wallet.getBalance();
      return balance;
    } catch (error) {
      console.error(`[${this.name}] Failed to get balance:`, error);
      throw new Error(`Failed to get ${this.name} balance`);
    }
  }

  /**
   * Send AVAX payment to another address
   * @param toAddress - Recipient address
   * @param amountInAvax - Amount in AVAX as string (e.g., "0.001")
   * @returns Transaction hash
   */
  async pay(toAddress: string, amountInAvax: string): Promise<string> {
    try {
      console.log(`[${this.name}] Initiating payment of ${amountInAvax} AVAX to ${toAddress}`);
      
      const txHash = await this.wallet.sendNative(toAddress, amountInAvax);
      
      console.log(`[${this.name}] Payment sent! Transaction hash: ${txHash}`);
      return txHash;
    } catch (error) {
      console.error(`[${this.name}] Payment failed:`, error);
      throw new Error(`${this.name} payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get wallet instance (for advanced operations if needed)
   */
  getWallet(): AvalancheWallet {
    return this.wallet;
  }
}
