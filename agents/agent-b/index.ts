/**
 * Agent B - Payment receiver agent
 */

import { Agent } from '../shared/types';
import { AvalancheWallet } from '../../wallet-service';
import { createAgentBWallet } from './wallet';

export class AgentB implements Agent {
  private wallet: AvalancheWallet;
  private readonly name = 'Agent B';

  constructor(wallet?: AvalancheWallet) {
    this.wallet = wallet || createAgentBWallet();
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
   * Get wallet instance (for advanced operations if needed)
   */
  getWallet(): AvalancheWallet {
    return this.wallet;
  }
}
