/**
 * Clean Avalanche Wallet implementation using ethers.js
 * No x402 logic - just pure Avalanche Fuji operations
 */

import { ethers } from 'ethers';
import { AVALANCHE_FUJI_RPC, DEFAULT_GAS_LIMIT } from './constants';

export class AvalancheWallet {
  private wallet: ethers.Wallet;
  private provider: ethers.JsonRpcProvider;

  constructor(privateKey: string) {
    this.provider = new ethers.JsonRpcProvider(AVALANCHE_FUJI_RPC);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  /**
   * Create a random wallet for testing
   */
  static createRandom(): AvalancheWallet {
    const randomWallet = ethers.Wallet.createRandom();
    return new AvalancheWallet(randomWallet.privateKey);
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
      console.error('Failed to get balance:', error);
      throw new Error('Failed to fetch wallet balance');
    }
  }

  /**
   * Send native AVAX to another address
   * @param to - Recipient address
   * @param amountInAvax - Amount in AVAX (e.g., "0.1")
   * @returns Transaction hash
   */
  async sendNative(to: string, amountInAvax: string): Promise<string> {
    try {
      // Validate recipient address
      if (!ethers.isAddress(to)) {
        throw new Error('Invalid recipient address');
      }

      // Convert AVAX to wei
      const amountInWei = ethers.parseEther(amountInAvax);

      // Send transaction
      const tx = await this.wallet.sendTransaction({
        to,
        value: amountInWei,
        gasLimit: DEFAULT_GAS_LIMIT
      });

      console.log(`Transaction sent: ${tx.hash}`);
      return tx.hash;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw new Error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the private key (use with caution)
   */
  getPrivateKey(): string {
    return this.wallet.privateKey;
  }
}
