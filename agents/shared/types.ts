/**
 * Shared types for Agent system
 */

export interface Agent {
  /**
   * Get the agent's name
   */
  getName(): string;

  /**
   * Get the agent's wallet address
   */
  getAddress(): Promise<string>;

  /**
   * Get the agent's balance in human-readable AVAX format
   */
  getBalance(): Promise<string>;
}
